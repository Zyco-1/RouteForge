import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user
      const providerToken = data.session.provider_token

      // Sync profile and store encrypted GitHub token if available
      if (providerToken) {
        try {
          const encryptedToken = encrypt(providerToken)
          const supabaseService = await createServiceRoleClient()
          await supabaseService
            .from('profiles')
            .update({ encrypted_github_token: encryptedToken })
            .eq('id', user.id)
        } catch (e) {
          console.error('Error syncing provider token:', e)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    if (error) {
       console.error('Auth callback exchange error:', error)
       return NextResponse.redirect(`${origin}/?error=exchange_error&error_description=${encodeURIComponent(error.message)}`)
    }
  }

  // Return the user to an error page if something went wrong
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
