const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixAdditionalMissingCustomer() {
  try {
    const userId = 'ef6f589f-6d8c-4e02-a3f6-32eb854ba5fd';
    const missingPageId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    
    console.log('🔍 新たに不足している customer_page_id を修正します:', missingPageId);
    
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
    
    // 不足しているレコードを作成
    const newRecord = {
      id: missingPageId,
      user_id: userId,
      title: '新規顧客 2025/9/25',
      customer_name: null,
      address: null,
      phone: null,
      email: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔧 新しいレコードを作成中:', newRecord);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('customer_pages')
      .insert(newRecord)
      .select();
      
    if (insertError) {
      console.error('❌ レコード作成エラー:', insertError);
    } else {
      console.log('✅ レコード作成成功:', insertedData);
    }
    
    // 追加確認：すべての customer_pages の状況をチェック
    const { data: allPages, error: allError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('user_id', userId);
      
    if (allError) {
      console.error('❌ 全レコード確認エラー:', allError);
    } else {
      console.log('📋 現在のすべての customer_pages レコード:');
      allPages.forEach((page, index) => {
        console.log(`  ${index + 1}. ID: ${page.id}, Title: ${page.title}, Created: ${page.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

fixAdditionalMissingCustomer();