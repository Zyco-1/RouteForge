import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('GitHub Callback Start: code present?', !!code);

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('Supabase Session Exchange Error:', error?.message);
    return NextResponse.redirect(`${origin}/?error=exchange_error`)
  }

  const user = data.session.user
  const providerToken = data.session.provider_token

  console.log('Auth Success. User ID:', user.id);
  console.log('Provider Token detected:', !!providerToken);

  const supabaseService = await createServiceRoleClient()

  // 1. Core Profile Sync
  const githubUsername = user.user_metadata?.user_name || user.user_metadata?.full_name || 'User'
  const githubId = user.user_metadata?.sub || user.app_metadata?.provider_id

  const updateData: any = {
    id: user.id,
    email: user.email,
    github_username: githubUsername,
    github_id: githubId ? parseInt(githubId) : null,
    updated_at: new Date().toISOString(),
  }

  // 2. Encrypt Token immediately if present
  if (providerToken) {
    try {
        console.log('Encrypting GitHub provider token...');
        updateData.encrypted_github_token = encrypt(providerToken);
        console.log('Token encrypted successfully.');
    } catch (encErr: any) {
        console.error('Encryption Failed during Callback:', encErr.message);
    }
  } else {
    console.warn('WARNING: provider_token was NULL in session response.');
  }

  // 3. Force Sync with confirmation
  console.log('Attempting Database Sync for profile:', user.id);
  const { data: updatedProfile, error: upsertError } = await supabaseService
    .from('profiles')
    .upsert(updateData, { onConflict: 'id' })
    .select('encrypted_github_token, github_username')
    .single();

  if (upsertError) {
    console.error('CRITICAL DB ERROR during profile sync:', upsertError.message);
  } else {
    console.log('Profile Sync Verified. Saved token state:', updatedProfile.encrypted_github_token ? 'SAVED (length ' + updatedProfile.encrypted_github_token.length + ')' : 'NULL');
  }

  return NextResponse.redirect(`${origin}${next}`)
}
