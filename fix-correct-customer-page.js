const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixCorrectCustomerPage() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const missingPageId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    
    console.log('🔍 正しい構造で customer_page_id を修正します:', missingPageId);
    
    // 既存のレコードをチェック
    const { data: existing, error: existingError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', missingPageId);
      
    if (existingError) {
      console.error('❌ 既存レコードチェックエラー:', existingError);
    } else if (existing && existing.length > 0) {
      console.log('✅ レコードは既に存在します:', existing[0]);
      return;
    }
    
    // 正しいカラム名でレコードを作成
    const newRecord = {
      id: missingPageId,
      user_id: userId,
      title: '新規顧客 2025/9/25',
      description: null,
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      customer_address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔧 正しい構造で新しいレコードを作成中:', newRecord);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('customer_pages')
      .insert(newRecord)
      .select();
      
    if (insertError) {
      console.error('❌ レコード作成エラー:', insertError);
    } else {
      console.log('✅ レコード作成成功:', insertedData);
    }
    
    // 最終確認
    const { data: finalCheck, error: finalError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', missingPageId)
      .single();
      
    if (finalError) {
      console.error('❌ 最終確認エラー:', finalError);
    } else {
      console.log('✅ 最終確認成功 - レコードが正しく作成されました:', finalCheck);
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

fixCorrectCustomerPage();