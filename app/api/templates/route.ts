import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 [Templates API] GET request received')

    const supabase = await createClient()

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [Templates API] Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's templates
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [Templates API] Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    console.log(`✅ [Templates API] Retrieved ${templates?.length || 0} templates`)
    return NextResponse.json({ templates })

  } catch (error) {
    console.error('❌ [Templates API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [Templates API] POST request received')

    const supabase = await createClient()

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [Templates API] Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      template_name,
      wall_color,
      roof_color,
      door_color,
      weather,
      layout_side_by_side,
      background_color,
      other_instructions
    } = body

    // Validate required fields
    if (!template_name || template_name.trim() === '') {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    // Save template to database
    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        template_name: template_name.trim(),
        wall_color: wall_color || null,
        roof_color: roof_color || null,
        door_color: door_color || null,
        weather: weather || null,
        layout_side_by_side: layout_side_by_side || false,
        background_color: background_color || null,
        other_instructions: other_instructions || null
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [Templates API] Database error:', error)
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
    }

    console.log(`✅ [Templates API] Template saved: ${template.template_name}`)
    return NextResponse.json({ template })

  } catch (error) {
    console.error('❌ [Templates API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}