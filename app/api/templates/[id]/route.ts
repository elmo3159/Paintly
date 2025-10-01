import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log(`🔍 [Templates API] GET request for ID: ${resolvedParams.id}`)

    const supabase = await createClient()

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ [Templates API] Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get specific template
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ [Templates API] Database error:', error)
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    console.log(`✅ [Templates API] Template retrieved: ${template.template_name}`)
    return NextResponse.json({ template })

  } catch (error) {
    console.error('❌ [Templates API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log(`🗑️ [Templates API] DELETE request for ID: ${resolvedParams.id}`)

    const supabase = await createClient()

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ [Templates API] Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete template (only allow users to delete their own templates)
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ [Templates API] Database error:', error)
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }

    console.log(`✅ [Templates API] Template deleted: ${resolvedParams.id}`)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ [Templates API] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log(`✏️ [Templates API] PUT request for ID: ${resolvedParams.id}`)

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

    // Update template (only allow users to update their own templates)
    const { data: template, error } = await supabase
      .from('templates')
      .update({
        template_name: template_name.trim(),
        wall_color: wall_color || null,
        roof_color: roof_color || null,
        door_color: door_color || null,
        weather: weather || null,
        layout_side_by_side: layout_side_by_side || false,
        background_color: background_color || null,
        other_instructions: other_instructions || null
      })
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ [Templates API] Database error:', error)
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }

    console.log(`✅ [Templates API] Template updated: ${template.template_name}`)
    return NextResponse.json({ template })

  } catch (error) {
    console.error('❌ [Templates API] PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}