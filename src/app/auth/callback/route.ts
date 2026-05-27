import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('Session exchange error:', error)
    return NextResponse.redirect(`${origin}/?error=exchange_error`)
  }

  const user = data.session.user
  const providerToken = data.session.provider_token
  const supabaseService = await createServiceRoleClient()

  // 1. Mandatory Profile Sync
  const githubUsername = user.user_metadata?.user_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const githubId = user.user_metadata?.sub || user.app_metadata?.provider_id

  const updateData: any = {
    id: user.id,
    email: user.email,
    github_username: githubUsername,
    github_id: githubId ? parseInt(githubId) : null,
    updated_at: new Date().toISOString(),
  }

  // 2. Encrypt and store GitHub token if present
  if (providerToken) {
    updateData.encrypted_github_token = encrypt(providerToken)
  }

  const { error: upsertError } = await supabaseService
    .from('profiles')
    .upsert(updateData, { onConflict: 'id' })

  if (upsertError) {
    console.error('CRITICAL: Profile upsert failed:', upsertError)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
