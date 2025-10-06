const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk' // service_role key

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCustomerDatabase() {
  const recentCustomerId = '21cadf5d-0f3d-4369-8ed6-2d094c52303a' // 最近作成された顧客ID
  const userId = 'e7078ac4-f843-4026-921d-b869ba37d335' // 認証されたユーザーID

  console.log('🔍 顧客データベースを詳しく調査します...')
  console.log(`📋 対象顧客ID: ${recentCustomerId}`)
  console.log(`👤 対象ユーザーID: ${userId}`)

  // 1. 最近作成された顧客データが存在するか確認
  console.log('\n1. 特定の顧客IDでデータを検索:')
  const { data: specificCustomer, error: specificError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', recentCustomerId)
    .single()

  if (specificError) {
    console.log('❌ 特定顧客データ取得エラー:', specificError)
  } else {
    console.log('✅ 特定顧客データ:', specificCustomer)
  }

  // 2. このユーザーのすべての顧客データを取得
  console.log('\n2. ユーザーのすべての顧客データを検索:')
  const { data: allCustomers, error: allError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (allError) {
    console.log('❌ 全顧客データ取得エラー:', allError)
  } else {
    console.log('✅ 全顧客データ一覧:')
    allCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ID: ${customer.id}`)
      console.log(`      タイトル: ${customer.title}`)
      console.log(`      作成日: ${customer.created_at}`)
      console.log('')
    })
  }

  // 3. RLSポリシーをバイパスしないクエリでテスト（anonキー使用）
  console.log('\n3. 通常のクライアント権限でのデータアクセステスト:')
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM'
  const anonSupabase = createClient(supabaseUrl, anonKey)

  const { data: anonCustomer, error: anonError } = await anonSupabase
    .from('customers')
    .select('*')
    .eq('id', recentCustomerId)
    .single()

  if (anonError) {
    console.log('❌ 匿名権限でのデータ取得エラー:', anonError)
    console.log('📝 これはRLS（Row Level Security）が原因の可能性があります')
  } else {
    console.log('✅ 匿名権限でのデータ取得成功:', anonCustomer)
  }

  // 4. テーブル全体の件数確認
  console.log('\n4. customersテーブル全体の件数:')
  const { count, error: countError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.log('❌ 件数取得エラー:', countError)
  } else {
    console.log(`✅ customersテーブル全体の件数: ${count}件`)
  }

  console.log('\n🔍 調査完了')
}

debugCustomerDatabase().catch(console.error)