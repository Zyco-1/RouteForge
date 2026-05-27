import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Login request method:', request.method);

  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  console.log('Using origin for redirect:', origin);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/api/auth/callback/github`,
      scopes: 'repo read:user user:email',
    },
  });

  if (error) {
    console.error('OAuth sign in error:', error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  // Force a 302 Found redirect to ensure the browser switches to GET if it was somehow a POST
  return NextResponse.redirect(data.url, 302);
}

export async function POST(request: Request) {
  console.log('Login POST request received - forwarding to GET handler');
  return GET(request);
}
