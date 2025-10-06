const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('=== Supabaseスキーマ確認 ===');

    // テーブル一覧を取得
    const { data: tables, error: tablesError } = await supabase
      .rpc('pg_list_tables');

    if (tablesError) {
      console.log('テーブル一覧取得失敗、別の方法を試します...');
    } else {
      console.log('テーブル一覧:', tables);
    }

    // 既存ユーザーを確認
    console.log('\n=== 既存ユーザーの確認 ===');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    if (usersError) {
      console.log('ユーザーテーブルエラー:', usersError);
    } else {
      console.log('既存ユーザー数:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('ユーザーサンプル:', users[0]);
        console.log('ユーザーテーブルのカラム:', Object.keys(users[0]));
      }
    }

    // プランを確認
    console.log('\n=== プランの確認 ===');
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .limit(3);

    if (plansError) {
      console.log('プランテーブルエラー:', plansError);
    } else {
      console.log('プラン数:', plans?.length || 0);
      if (plans && plans.length > 0) {
        console.log('プランサンプル:', plans[0]);
      }
    }

    // サブスクリプションを確認
    console.log('\n=== サブスクリプションの確認 ===');
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(3);

    if (subscriptionsError) {
      console.log('サブスクリプションテーブルエラー:', subscriptionsError);
    } else {
      console.log('サブスクリプション数:', subscriptions?.length || 0);
      if (subscriptions && subscriptions.length > 0) {
        console.log('サブスクリプションサンプル:', subscriptions[0]);
      }
    }

    // 顧客ページを確認
    console.log('\n=== 顧客ページの確認 ===');
    const { data: customerPages, error: customerPagesError } = await supabase
      .from('customer_pages')
      .select('*')
      .limit(3);

    if (customerPagesError) {
      console.log('顧客ページテーブルエラー:', customerPagesError);
    } else {
      console.log('顧客ページ数:', customerPages?.length || 0);
      if (customerPages && customerPages.length > 0) {
        console.log('顧客ページサンプル:', customerPages[0]);
      }
    }

  } catch (error) {
    console.error('スキーマ確認中にエラー:', error);
  }
}

checkSchema().catch(console.error);