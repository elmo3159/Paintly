import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD,
    ENV_FILES_CHECKED: ['.env.local', '.env.production', '.env']
  }

  return NextResponse.json(envVars)
}