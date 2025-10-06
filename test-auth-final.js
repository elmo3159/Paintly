const fetch = require('node-fetch');

async function testAuthAPI() {
  try {
    console.log('1. Supabase認証APIに直接ログインテスト...');

    const response = await fetch('https://mockfjcakfzbzccabcgm.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM'
      },
      body: JSON.stringify({
        email: 'elmodayo3159@gmail.com',
        password: 'sanri3159'
      })
    });

    console.log('2. レスポンスステータス:', response.status);

    const data = await response.json();
    console.log('3. レスポンスデータ:', JSON.stringify(data, null, 2));

    if (response.status === 200 && data.access_token) {
      console.log('✅ 認証成功: access_tokenが取得できました');
    } else {
      console.log('❌ 認証失敗:', data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ APIテストエラー:', error);
  }
}

testAuthAPI();