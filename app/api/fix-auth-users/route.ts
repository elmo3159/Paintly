import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk'

export async function POST() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // auth.usersテーブルの現在の状態を確認
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(10)
    
    console.log('🔍 Existing users:', existingUsers)
    
    // 既存のユーザーを使用するか、新しくユーザーを作成
    let actualUserId
    
    if (existingUsers && existingUsers.length > 0) {
      // 既存のユーザーを使用
      actualUserId = existingUsers[0].id
      console.log(`📋 Using existing user ID: ${actualUserId}`)
    } else {
      // 新しいユーザーを作成
      console.log('🔧 Creating new user...')
      const { data: insertData, error: insertError } = await supabaseAdmin.auth.admin.createUser({
        email: 'test@example.com',
        password: 'testpassword123',
        email_confirm: true
      })
      
      if (insertError) {
        console.error('❌ User creation error:', insertError)
        throw insertError
      }
      
      actualUserId = insertData.user.id
      console.log('✅ User created successfully with ID:', actualUserId)
    }
    
    // customersテーブルの状態も確認
    const { data: customers, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .limit(10)
    
    console.log('👥 Customers table:', customers)
    
    // テスト顧客を作成
    if (customers?.length === 0) {
      const testCustomers = [
      {
        id: '009e75c8-b18d-4583-8b77-ec2623c575ee',
        user_id: actualUserId,
        title: 'テスト顧客 A',
        created_at: new Date().toISOString()
      },
      {
        id: 'b200dfa6-1f05-4d92-b794-838cf784dbe7',
        user_id: actualUserId,
        title: 'テスト顧客 B',
        created_at: new Date().toISOString()
      },
      {
        id: '33d3c85f-521a-4ee1-a7af-392d4f7bb997',
        user_id: actualUserId,
        title: 'サンプル顧客 C',
        created_at: new Date().toISOString()
      },
      {
        id: '4802b7ec-f000-437a-a509-02f121cbd9a3',
        user_id: actualUserId,
        title: 'サンプル顧客 D',
        created_at: new Date().toISOString()
      },
      {
        id: '92b8df2b-579c-40ca-945d-2793bacfd5fa',
        user_id: actualUserId,
        title: 'サンプル顧客 E',
        created_at: new Date().toISOString()
      }
    ]
      
      const { data: customerInsert, error: customerInsertError } = await supabaseAdmin
        .from('customers')
        .insert(testCustomers)
      
      if (customerInsertError) {
        console.error('❌ Customer creation error:', customerInsertError)
        throw customerInsertError
      }
      
      console.log('✅ Test customers created successfully')
    }
    
    return NextResponse.json({ 
      success: true, 
      actualUserId,
      customersCount: customers?.length || 0 
    })
    
  } catch (error) {
    console.error('❌ Fix auth users error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // 現在の状態を取得
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(10)
    
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .limit(10)
    
    return NextResponse.json({
      users: users || [],
      customers: customers || [],
      usersError,
      customersError
    })
    
  } catch (error) {
    console.error('❌ Get data error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}