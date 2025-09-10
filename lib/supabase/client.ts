import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Return a dummy client if env vars are not set (for build time)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createBrowserClient(
      'https://example.supabase.co',
      'dummy-anon-key'
    )
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}