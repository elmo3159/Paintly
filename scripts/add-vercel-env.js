const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv[2];
const PROJECT_ID = 'prj_XhTQeKrQRGfE6W3qiQdOmcdxJxEH';
const TEAM_ID = 'team_F7tXYzW3zZ9XLLwWAHjlqEVq';
const ENV_KEY = 'STRIPE_WEBHOOK_SECRET';
const ENV_VALUE = process.argv[3] || 'whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9';

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN が指定されていません');
  console.log('💡 実行方法: node scripts/add-vercel-env.js <VERCEL_TOKEN> [STRIPE_WEBHOOK_SECRET]');
  process.exit(1);
}

async function addEnvVariable() {
  const data = JSON.stringify({
    key: ENV_KEY,
    value: ENV_VALUE,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  });

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Vercel環境変数の追加に成功しました！');
          console.log('\n📋 追加された環境変数:');
          console.log(`  Key: ${ENV_KEY}`);
          console.log(`  Value: ${ENV_VALUE.substring(0, 20)}...`);
          console.log(`  Target: production, preview, development`);
          console.log('\n📝 次のステップ:');
          console.log('  1. Vercel が自動的に再デプロイを開始します');
          console.log('  2. デプロイ完了後、Stripe Webhook が正常に動作します');
          resolve(JSON.parse(body));
        } else {
          console.error('❌ エラーが発生しました:', res.statusCode);
          console.error('Response:', body);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ リクエストエラー:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

console.log('🔧 Vercel環境変数を追加中...');
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Team ID: ${TEAM_ID}`);
console.log(`   Key: ${ENV_KEY}\n`);

addEnvVariable().catch((error) => {
  console.error('実行に失敗しました:', error.message);
  process.exit(1);
});
