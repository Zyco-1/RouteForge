import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth Callback: Processing code exchange...')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user
      const providerToken = data.session.provider_token

      console.log('Auth successful for user:', user.id)

      if (providerToken) {
        try {
          console.log('Capturing provider token...')
          const encryptedToken = encrypt(providerToken)
          const supabaseService = await createServiceRoleClient()

          const { error: updateError } = await supabaseService
            .from('profiles')
            .update({
                encrypted_github_token: encryptedToken,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error storing token in profile:', updateError)
          } else {
            console.log('Provider token stored successfully.')
          }
        } catch (e) {
          console.error('Encryption or service role error:', e)
        }
      } else {
        console.warn('No provider_token found in session. Ensure "repo" scope is requested.')
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    if (error) {
       console.error('Exchange error:', error.message)
       return NextResponse.redirect(`${origin}/?error=exchange_error&error_description=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
