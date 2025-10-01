import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get table schema for generations table
    const { data: columns, error } = await serviceSupabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'generations')
      .eq('table_schema', 'public')
      .order('ordinal_position')

    if (error) {
      console.error('Schema query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      table: 'generations',
      columns: columns || [],
      count: columns?.length || 0
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Schema debug error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'add_fal_response_column') {
      // Add fal_response column to generations table
      const { data, error } = await serviceSupabase
        .rpc('exec_sql', { 
          query: 'ALTER TABLE generations ADD COLUMN IF NOT EXISTS fal_response JSONB;' 
        })

      if (error) {
        console.error('Add column error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'fal_response column added successfully',
        data
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Schema modification error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}