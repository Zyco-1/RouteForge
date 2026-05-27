import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await checkRateLimit(`auth-vercel-${ip}`);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  if (!code) return NextResponse.redirect(`${origin}/dashboard?error=no_code`);

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('User authentication failed during Vercel callback:', userError);
    return NextResponse.redirect(`${origin}/login?error=not_authenticated`);
  }

  try {
    console.log('Exchanging code for Vercel access token...');
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

    const data = await response.json();
    if (!response.ok) {
      console.error('Vercel OAuth exchange failed:', data);
      return NextResponse.redirect(`${origin}/dashboard?error=vercel_auth_failed&msg=${encodeURIComponent(data.error_description || data.message || 'Unknown error')}`);
    }

    const accessToken = data.access_token;
    if (!accessToken) {
        throw new Error('No access_token returned from Vercel');
    }

    console.log('Vercel token received. Encrypting...');
    const encryptedToken = encrypt(accessToken);

    let vercelTeamSlug = null;
    if (data.team_id) {
       console.log('Fetching Vercel team metadata for teamId:', data.team_id);
       const teamRes = await fetch(`https://api.vercel.com/v2/teams/${data.team_id}`, {
         headers: { Authorization: `Bearer ${accessToken}` }
       });
       if (teamRes.ok) {
         const teamData = await teamRes.json();
         vercelTeamSlug = teamData.slug;
       }
    }

    console.log('Updating user profile with Vercel metadata...');
    const supabaseService = await createServiceRoleClient();
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({
        encrypted_vercel_token: encryptedToken,
        vercel_user_id: data.user_id,
        vercel_team_id: data.team_id,
        vercel_team_slug: vercelTeamSlug,
        vercel_installation_id: data.installation_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('CRITICAL DATABASE ERROR during Vercel profile sync:', updateError);
      return NextResponse.redirect(`${origin}/dashboard?error=database_error&msg=${encodeURIComponent(updateError.message)}`);
    }

    console.log('Vercel integration successful for user:', user.id);
    return NextResponse.redirect(`${origin}/dashboard?success=vercel_connected`);
  } catch (err: any) {
    console.error('Vercel callback exception:', err);
    return NextResponse.redirect(`${origin}/dashboard?error=internal_server_error&msg=${encodeURIComponent(err.message)}`);
  }
}
