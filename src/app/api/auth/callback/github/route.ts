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
  const { success } = await checkRateLimit(`auth-github-${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const user = data.session.user;
      const providerToken = data.session.provider_token;

      if (providerToken) {
        // Encrypt and store token in profiles
        const encryptedToken = encrypt(providerToken);
        const supabaseService = await createServiceRoleClient();

        await supabaseService
          .from('profiles')
          .update({ encrypted_github_token: encryptedToken })
          .eq('id', user.id);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
