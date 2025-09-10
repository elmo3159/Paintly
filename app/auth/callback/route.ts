import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user after successful authentication
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user exists in our users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        // If user doesn't exist, create user record
        if (!existingUser) {
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url,
            })

          // Create free plan subscription for new user
          const { data: freePlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', '無料プラン')
            .single()

          if (freePlan) {
            await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan_id: freePlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                generation_count: 0,
              })
          }
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=Could not authenticate user`)
}