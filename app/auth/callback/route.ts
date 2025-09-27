import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // Use environment variable for correct redirect URL instead of request origin
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    console.log('DEBUG: NEXT_PUBLIC_APP_URL =', process.env.NEXT_PUBLIC_APP_URL)
    console.log('DEBUG: origin =', origin)
    console.log('DEBUG: request.url =', request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/signin?error=No authentication code received`)
    }

    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(sessionError.message)}`)
    }

    // Get the user after successful authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User fetch error:', userError)
      return NextResponse.redirect(`${origin}/auth/signin?error=Failed to get user information`)
    }

    try {
      // Check if user exists in our users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing user:', checkError)
      }

      // If user doesn't exist, create user record
      if (!existingUser) {
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
          })

        if (insertUserError) {
          console.error('Error creating user:', insertUserError)
          // Continue even if user creation fails - auth is successful
        } else {
          // Try to create free plan subscription for new user
          const { data: freePlan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('name', '無料プラン')
            .maybeSingle()

          if (planError) {
            console.error('Error fetching free plan:', planError)
          } else if (freePlan) {
            const { error: subError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan_id: freePlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                generation_count: 0,
              })

            if (subError) {
              console.error('Error creating subscription:', subError)
            }
          }
        }
      }
    } catch (dbError) {
      // Log database errors but don't fail authentication
      console.error('Database operation error:', dbError)
    }
    
    // Redirect to dashboard even if database operations fail
    return NextResponse.redirect(`${origin}${next}`)
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    // Use environment variable for correct redirect URL instead of request origin
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    return NextResponse.redirect(`${origin}/auth/signin?error=An unexpected error occurred`)
  }
}