const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk' // service_role key

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugSpecificCustomer() {
  const targetCustomerId = '470c7087-6051-4f6c-9d12-5b962d0abeb3' // サイドバーからアクセスした顧客ID
  const currentUserId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd' // コンソールから確認した現在のユーザーID

  console.log('🔍 特定顧客データの詳細調査を開始')
  console.log(`📋 対象顧客ID: ${targetCustomerId}`)
  console.log(`👤 現在のユーザーID: ${currentUserId}`)

  // 1. 特定の顧客データを取得
  console.log('\n1. 対象顧客データを取得:')
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', targetCustomerId)
    .single()

  if (customerError) {
    console.log('❌ 顧客データ取得エラー:', customerError)
  } else {
    console.log('✅ 顧客データ:', customer)
    console.log(`   顧客のuser_id: ${customer.user_id}`)
    console.log(`   現在のユーザーID: ${currentUserId}`)
    console.log(`   user_id一致: ${customer.user_id === currentUserId ? '✅' : '❌'}`)
  }

  // 2. 現在のユーザーの全顧客を取得
  console.log('\n2. 現在のユーザーの全顧客データ:')
  const { data: userCustomers, error: userError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false })

  if (userError) {
    console.log('❌ ユーザー顧客データ取得エラー:', userError)
  } else {
    console.log('✅ ユーザー顧客データ一覧:')
    userCustomers.forEach((cust, index) => {
      console.log(`   ${index + 1}. ID: ${cust.id}`)
      console.log(`      タイトル: ${cust.title}`)
      console.log(`      作成日: ${cust.created_at}`)
      console.log(`      user_id: ${cust.user_id}`)
      console.log('')
    })
  }

  // 3. RLSテスト（匿名キー使用）
  console.log('\n3. RLS動作テスト（匿名キー使用）:')
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM'
  const anonSupabase = createClient(supabaseUrl, anonKey)

  // ユーザー認証をシミュレート（実際にはフロントエンドで行われる）
  console.log('📝 注意: 実際にはフロントエンドでユーザー認証が必要です')
  
  const { data: anonCustomer, error: anonError } = await anonSupabase
    .from('customers')
    .select('*')
    .eq('id', targetCustomerId)
    .single()

  if (anonError) {
    console.log('❌ 匿名キーでの顧客データ取得エラー:', anonError)
    console.log('   エラーコード:', anonError.code)
    console.log('   エラーメッセージ:', anonError.message)
  } else {
    console.log('✅ 匿名キーでの顧客データ取得成功:', anonCustomer)
  }

  // 4. 解決策の提案
  console.log('\n4. 問題の分析と解決策:')
  if (customer && customer.user_id !== currentUserId) {
    console.log('🔧 問題: user_idの不一致が原因')
    console.log('📝 解決策の選択肢:')
    console.log('   A) 顧客データのuser_idを現在のユーザーIDに変更')
    console.log('   B) RLSポリシーを無効化または修正')
    console.log('   C) ユーザーを正しいアカウントに変更')
  } else {
    console.log('🔧 RLSポリシーまたは権限設定の問題')
  }

  console.log('\n🔍 調査完了')
}

debugSpecificCustomer().catch(console.error)