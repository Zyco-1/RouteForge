import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('Vercel Callback Start: code present?', !!code);

  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success: rateOk } = await checkRateLimit(`auth-vercel-${ip}`);
  if (!rateOk) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  if (!code) return NextResponse.redirect(`${origin}/dashboard?error=no_code`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Vercel Callback Error: User not found in session.');
    return NextResponse.redirect(`${origin}/login?error=not_authenticated`);
  }

  try {
    console.log('Exchanging Vercel Auth Code...');
    const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.ROUTEFORGE_VERCEL_CLIENT_ID!,
        client_secret: process.env.ROUTEFORGE_VERCEL_CLIENT_SECRET!,
        code: code,
        redirect_uri: process.env.ROUTEFORGE_VERCEL_REDIRECT_URI!,
      }),
    });

    const vData = await response.json();
    if (!response.ok) {
      console.error('Vercel Token Exchange Failed:', vData);
      return NextResponse.redirect(`${origin}/dashboard?error=vercel_auth_failed`);
    }

    const accessToken = vData.access_token;
    if (!accessToken) throw new Error('Vercel returned success but no access_token found.');

    console.log('Encrypting Vercel Access Token...');
    const encryptedToken = encrypt(accessToken);

    let vercelTeamSlug = null;
    if (vData.team_id) {
       console.log('Fetching Vercel team info for:', vData.team_id);
       const teamRes = await fetch(`https://api.vercel.com/v2/teams/${vData.team_id}`, {
         headers: { Authorization: `Bearer ${accessToken}` }
       });
       if (teamRes.ok) {
         const tData = await teamRes.json();
         vercelTeamSlug = tData.slug;
       }
    }

    console.log('Updating profile with Vercel metadata for user:', user.id);
    const supabaseService = await createServiceRoleClient();
    const { data: updatedProfile, error: dbErr } = await supabaseService
      .from('profiles')
      .update({
        encrypted_vercel_token: encryptedToken,
        vercel_user_id: vData.user_id,
        vercel_team_id: vData.team_id,
        vercel_team_slug: vercelTeamSlug,
        vercel_installation_id: vData.installation_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('encrypted_vercel_token')
      .single();

    if (dbErr) {
      console.error('CRITICAL DB ERROR during Vercel integration sync:', dbErr.message);
      return NextResponse.redirect(`${origin}/dashboard?error=database_error`);
    }

    console.log('Vercel Integration Sync verified. Saved state:', updatedProfile.encrypted_vercel_token ? 'SAVED' : 'NULL');
    return NextResponse.redirect(`${origin}/dashboard?success=vercel_connected`);

  } catch (err: any) {
    console.error('Vercel Callback Exception:', err.message);
    return NextResponse.redirect(`${origin}/dashboard?error=internal_server_error`);
  }
}
