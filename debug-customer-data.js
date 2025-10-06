const { createClient } = require('@supabase/supabase-js')

// Supabase設定（CLAUDE.mdから）
const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCustomersTable() {
  console.log('🔍 顧客テーブルの調査開始...')
  
  try {
    // 全顧客データを取得
    console.log('\n📋 全顧客データの取得中...')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
    
    if (customersError) {
      console.error('❌ 顧客データ取得エラー:', customersError)
    } else {
      console.log('✅ 顧客データ取得成功')
      console.log(`📊 顧客数: ${customers.length}`)
      
      if (customers.length > 0) {
        console.log('\n👥 顧客リスト:')
        customers.forEach((customer, index) => {
          console.log(`${index + 1}. ID: ${customer.id}`)
          console.log(`   Title: ${customer.title}`)
          console.log(`   Name: ${customer.customer_name}`)
          console.log(`   Created: ${customer.created_at}`)
          console.log('   ---')
        })
      }
    }
    
    // 特定の顧客IDをテスト
    const testCustomerId = '56cd4a9f-ee95-4096-aac7-ae3358e3d168'
    console.log(`\n🎯 特定顧客 (${testCustomerId}) の取得テスト...`)
    
    const { data: specificCustomer, error: specificError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', testCustomerId)
      .single()
    
    if (specificError) {
      console.error('❌ 特定顧客取得エラー:', specificError)
      console.error('   Code:', specificError.code)
      console.error('   Details:', specificError.details)
      console.error('   Hint:', specificError.hint)
      console.error('   Message:', specificError.message)
    } else {
      console.log('✅ 特定顧客取得成功')
      console.log('📄 顧客データ:', JSON.stringify(specificCustomer, null, 2))
    }
    
  } catch (error) {
    console.error('💥 予期しないエラー:', error)
  }
}

async function testAuth() {
  console.log('\n🔐 認証状態の確認...')
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ 認証エラー:', error)
    } else if (user) {
      console.log('✅ ユーザー認証済み')
      console.log(`👤 User ID: ${user.id}`)
      console.log(`📧 Email: ${user.email}`)
    } else {
      console.log('⚠️ ユーザーが認証されていません')
    }
  } catch (error) {
    console.error('💥 認証チェックでエラー:', error)
  }
}

async function main() {
  console.log('🚀 Supabaseデータベース接続テスト開始')
  console.log('=' .repeat(50))
  
  await testAuth()
  await testCustomersTable()
  
  console.log('\n' + '='.repeat(50))
  console.log('✨ テスト完了')
}

main().catch(console.error)