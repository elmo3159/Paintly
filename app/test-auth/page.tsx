export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

export default async function TestAuthPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <pre className="bg-gray-100 p-4 rounded">
          <code>
            {JSON.stringify({ user, error }, null, 2)}
          </code>
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page - Error</h1>
        <pre className="bg-red-100 p-4 rounded text-red-900">
          <code>
            {JSON.stringify({ error: error instanceof Error ? error.message : error }, null, 2)}
          </code>
        </pre>
      </div>
    )
  }
}