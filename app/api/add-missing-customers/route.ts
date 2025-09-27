import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

export async function POST() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // 既存ユーザーIDを取得
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1)
    
    if (!existingUsers || existingUsers.length === 0) {
      throw new Error('No users found')
    }
    
    const userId = existingUsers[0].id
    console.log(`📋 Using user ID: ${userId}`)
    
    // サイドバーに表示されているが存在しない顧客IDを追加
    const missingCustomers = [
      {
        id: '33d3c85f-521a-4ee1-a7af-392d4f7bb997',
        user_id: userId,
        title: 'サンプル顧客 C',
        created_at: new Date().toISOString()
      },
      {
        id: '4802b7ec-f000-437a-a509-02f121cbd9a3',
        user_id: userId,
        title: 'サンプル顧客 D',
        created_at: new Date().toISOString()
      },
      {
        id: '92b8df2b-579c-40ca-945d-2793bacfd5fa',
        user_id: userId,
        title: 'サンプル顧客 E',
        created_at: new Date().toISOString()
      },
      {
        id: '56cd4a9f-ee95-4096-aac7-ae3358e3d168',
        user_id: userId,
        title: 'サンプル顧客 F',
        created_at: new Date().toISOString()
      },
      {
        id: '4a7640c2-ab42-45b7-aefa-23e6cbaf2d6b',
        user_id: userId,
        title: 'サンプル顧客 G',
        created_at: new Date().toISOString()
      }
    ]
    
    console.log('🔧 Adding missing customers:', missingCustomers.map(c => c.id))
    
    // 各顧客を個別に挿入（重複チェック付き）
    const results = []
    for (const customer of missingCustomers) {
      // 既存チェック
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('id', customer.id)
        .single()
      
      if (existing) {
        console.log(`⏭️ Customer ${customer.id} already exists, skipping`)
        continue
      }
      
      // 挿入
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('customers')
        .insert([customer])
        .select()
      
      if (insertError) {
        console.error(`❌ Error inserting customer ${customer.id}:`, insertError)
        results.push({ id: customer.id, success: false, error: insertError.message })
      } else {
        console.log(`✅ Customer ${customer.id} created successfully`)
        results.push({ id: customer.id, success: true, data: insertData })
      }
    }
    
    return NextResponse.json({ 
      success: true,
      userId,
      results,
      totalProcessed: missingCustomers.length
    })
    
  } catch (error) {
    console.error('❌ Add missing customers error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // 全顧客を取得
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      customers: customers || [],
      count: customers?.length || 0,
      customersError
    })
    
  } catch (error) {
    console.error('❌ Get customers error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}