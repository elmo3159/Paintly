import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use direct string access for Next.js environment variables to ensure proper build-time replacement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Validate environment variables are properly set
  if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseAnonKey || supabaseAnonKey === 'undefined') {
    console.error('❌ Supabase environment variables missing or invalid:', {
      url: supabaseUrl ? '✅ Set' : '❌ Missing',
      key: supabaseAnonKey ? '✅ Set' : '❌ Missing'
    })
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', supabaseUrl)
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`)
  }

  console.log('✅ Supabase client initialized with URL:', supabaseUrl.substring(0, 30) + '...')

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}