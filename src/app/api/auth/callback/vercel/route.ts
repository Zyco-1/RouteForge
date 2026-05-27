import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await checkRateLimit(`auth-vercel-${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard?error=no_code`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=not_authenticated`);
  }

  try {
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
      console.error('Vercel token exchange error:', data);
      return NextResponse.redirect(`${origin}/dashboard?error=vercel_auth_failed`);
    }

    // Capture all metadata
    const accessToken = data.access_token;
    const vercelUserId = data.user_id;
    const vercelTeamId = data.team_id;
    const installationId = data.installation_id;

    const encryptedToken = encrypt(accessToken);
    const supabaseService = await createServiceRoleClient();

    let vercelTeamSlug = null;
    if (vercelTeamId) {
       const teamRes = await fetch(`https://api.vercel.com/v2/teams/${vercelTeamId}`, {
         headers: { Authorization: `Bearer ${accessToken}` }
       });
       if (teamRes.ok) {
         const teamData = await teamRes.json();
         vercelTeamSlug = teamData.slug;
       }
    }

    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({
        encrypted_vercel_token: encryptedToken,
        vercel_user_id: vercelUserId,
        vercel_team_id: vercelTeamId,
        vercel_team_slug: vercelTeamSlug,
        vercel_installation_id: installationId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error saving Vercel integration metadata:', updateError);
      return NextResponse.redirect(`${origin}/dashboard?error=database_error`);
    }

    console.log('Vercel integration successfully linked for user:', user.id);
    return NextResponse.redirect(`${origin}/dashboard?success=vercel_connected`);
  } catch (err) {
    console.error('Vercel callback error:', err);
    return NextResponse.redirect(`${origin}/dashboard?error=internal_server_error`);
  }
}
