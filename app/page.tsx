import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  try {
    const supabase = await createClient()
    
    // Check if we have valid Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured')
      redirect('/auth/signin')
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      redirect('/auth/signin')
    }

    if (!user) {
      redirect('/auth/signin')
    }

    redirect('/dashboard')
  } catch (error) {
    console.error('Error in HomePage:', error)
    redirect('/auth/signin')
  }
}