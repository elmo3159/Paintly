const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTableStructure() {
  try {
    console.log('📋 customer_pages テーブル構造の確認...');
    
    // 既存レコードの詳細を確認して構造を理解する
    const { data: existingRecord, error } = await supabase
      .from('customer_pages')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ テーブル確認エラー:', error);
    } else {
      console.log('✅ 既存レコード構造:');
      if (existingRecord && existingRecord.length > 0) {
        console.log('データ例:', existingRecord[0]);
        console.log('カラム名一覧:', Object.keys(existingRecord[0]));
      }
    }
    
    // 不足しているIDの詳細を確認
    const missingId = 'b39feb84-9fdb-45db-a71c-0c0dac128136';
    const { data: checkExisting, error: checkError } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', missingId);
      
    if (checkError) {
      console.error('❌ ID確認エラー:', checkError);
    } else {
      if (checkExisting && checkExisting.length > 0) {
        console.log(`✅ ID ${missingId} は既に存在します:`, checkExisting[0]);
      } else {
        console.log(`❌ ID ${missingId} は存在しません - 作成が必要`);
      }
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

checkTableStructure();