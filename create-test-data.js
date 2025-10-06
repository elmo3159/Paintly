const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mockfjcakfzbzccabcgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestData() {
  try {
    console.log('=== Supabaseテストデータ作成開始 ===');

    // テストユーザーIDを生成
    const testUserId = 'a0b1c2d3-e4f5-6789-abcd-ef0123456789';

    console.log('1. テストユーザーを作成中...');

    // テストユーザーを作成（既存の場合はスキップ）
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', testUserId)
      .single();

    if (!existingUser) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: 'test-paintly@example.com',
          name: 'テストユーザー'
        });

      if (userError) {
        console.error('ユーザー作成エラー:', userError);
      } else {
        console.log('テストユーザーを作成しました');
      }
    } else {
      console.log('テストユーザーは既に存在します');
    }

    console.log('2. 無料プランのIDを取得中...');

    // 無料プランを取得
    const { data: freePlan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', 'free')
      .single();

    if (planError) {
      console.error('プラン取得エラー:', planError);
      return;
    }

    console.log('無料プランID:', freePlan.id);

    console.log('3. テストサブスクリプションを作成中...');

    // テストサブスクリプションを作成（既存の場合はスキップ）
    const { data: existingSubscription, error: subCheckError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', testUserId)
      .eq('status', 'active')
      .single();

    if (!existingSubscription) {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: testUserId,
          plan_id: freePlan.id,
          status: 'active',
          generation_count: 1, // 1回使用済み
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
        });

      if (subscriptionError) {
        console.error('サブスクリプション作成エラー:', subscriptionError);
      } else {
        console.log('テストサブスクリプションを作成しました');
      }
    } else {
      console.log('テストサブスクリプションは既に存在します');
    }

    console.log('4. テスト顧客ページを作成中...');

    // テスト顧客ページを作成
    const customerPages = [
      {
        user_id: testUserId,
        title: 'テスト顧客 A 邸',
        description: '外壁塗装とカラーシミュレーション',
        customer_name: '山田太郎',
        customer_email: 'yamada@example.com',
        customer_phone: '090-1234-5678',
        customer_address: '東京都渋谷区1-2-3'
      },
      {
        user_id: testUserId,
        title: 'テスト顧客 B 邸',
        description: '屋根と外壁の色変更',
        customer_name: '田中花子',
        customer_email: 'tanaka@example.com',
        customer_phone: '090-8765-4321',
        customer_address: '東京都新宿区4-5-6'
      },
      {
        user_id: testUserId,
        title: 'テスト顧客 C 邸',
        description: 'マンション外壁リフォーム',
        customer_name: '佐藤次郎',
        customer_email: 'sato@example.com',
        customer_phone: '090-5555-5555',
        customer_address: '東京都品川区7-8-9'
      }
    ];

    for (const customerPage of customerPages) {
      const { data: existingCustomer, error: customerCheckError } = await supabase
        .from('customer_pages')
        .select('id')
        .eq('user_id', testUserId)
        .eq('title', customerPage.title)
        .single();

      if (!existingCustomer) {
        const { data: customerData, error: customerError } = await supabase
          .from('customer_pages')
          .insert(customerPage);

        if (customerError) {
          console.error(`顧客ページ作成エラー (${customerPage.title}):`, customerError);
        } else {
          console.log(`顧客ページを作成しました: ${customerPage.title}`);
        }
      } else {
        console.log(`顧客ページは既に存在します: ${customerPage.title}`);
      }
    }

    console.log('5. データ確認中...');

    // 作成されたデータを確認
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    const { data: subscriptionData, error: subscriptionDataError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (
          name,
          generation_limit
        )
      `)
      .eq('user_id', testUserId)
      .eq('status', 'active')
      .single();

    const { data: customerData, error: customerDataError } = await supabase
      .from('customer_pages')
      .select('id, title, created_at')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    console.log('=== 作成されたテストデータ ===');
    console.log('ユーザー:', userData);
    console.log('サブスクリプション:', subscriptionData);
    console.log('顧客ページ数:', customerData?.length || 0);
    console.log('顧客ページ:', customerData);

    console.log('=== テストデータ作成完了 ===');
    console.log(`テストユーザーID: ${testUserId}`);
    console.log('これで認証テストに使用できます');

    return {
      userId: testUserId,
      user: userData,
      subscription: subscriptionData,
      customers: customerData
    };

  } catch (error) {
    console.error('テストデータ作成中にエラーが発生:', error);
  }
}

createTestData().catch(console.error);