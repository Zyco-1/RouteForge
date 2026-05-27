import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const teamId = requestUrl.searchParams.get('teamId'); // Present if installed on a team
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
    // Exchange code for Vercel token
    const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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

    const vercelToken = data.access_token;
    const vercelUserId = data.user_id;
    const vercelTeamId = data.team_id;
    const vercelInstallationId = data.installation_id;

    // Encrypt token
    const encryptedToken = encrypt(vercelToken);

    // Update profile using Service Role
    const supabaseService = await createServiceRoleClient();

    // Fetch team slug if it's a team installation
    let vercelTeamSlug = null;
    if (vercelTeamId) {
       const teamRes = await fetch(`https://api.vercel.com/v2/teams/${vercelTeamId}`, {
         headers: { Authorization: `Bearer ${vercelToken}` }
       });
       if (teamRes.ok) {
         const teamData = await teamRes.json();
         vercelTeamSlug = teamData.slug;
       }
    }

    await supabaseService
      .from('profiles')
      .update({
        encrypted_vercel_token: encryptedToken,
        vercel_user_id: vercelUserId,
        vercel_team_id: vercelTeamId,
        vercel_team_slug: vercelTeamSlug,
        vercel_installation_id: vercelInstallationId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.redirect(`${origin}/dashboard?success=vercel_connected`);
  } catch (err) {
    console.error('Vercel callback error:', err);
    return NextResponse.redirect(`${origin}/dashboard?error=internal_server_error`);
  }
}
