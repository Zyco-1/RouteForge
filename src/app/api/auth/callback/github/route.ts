import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  console.log('GitHub Callback received. Origin:', origin);

  if (error) {
    console.error('GitHub Callback Error:', error, error_description);
    return NextResponse.redirect(`${origin}/?error=${error}&error_description=${error_description}`);
  }

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await checkRateLimit(`auth-github-${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Supabase Session Exchange Error:', exchangeError);
      return NextResponse.redirect(`${origin}/?error=exchange_error&error_description=${encodeURIComponent(exchangeError.message)}`);
    }

    if (data.session) {
      const user = data.session.user;
      const providerToken = data.session.provider_token;

      console.log('Auth successful for user:', user.id);

      if (providerToken) {
        try {
          const encryptedToken = encrypt(providerToken);
          const supabaseService = await createServiceRoleClient();

          const { error: updateError } = await supabaseService
            .from('profiles')
            .update({ encrypted_github_token: encryptedToken })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile with token:', updateError);
          }
        } catch (encryptErr) {
          console.error('Encryption error during callback:', encryptErr);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  console.error('No code found in GitHub callback');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
