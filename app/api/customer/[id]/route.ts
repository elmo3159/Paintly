import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { title, customer_name, customer_address, customer_phone, customer_email, description } = body
    const { id } = await params

    // サービスロールを使用してRLS制限を回避
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabaseService
      .from('customer_pages')
      .update({
        title: title || null,
        customer_name: customer_name || null,
        customer_address: customer_address || null,
        customer_phone: customer_phone || null,
        customer_email: customer_email || null,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('❌ Customer update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update customer', details: error },
        { status: 400 }
      )
    }

    console.log('✅ Customer update successful with service role')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}