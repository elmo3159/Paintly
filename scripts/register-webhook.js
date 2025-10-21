const Stripe = require('stripe');

// コマンドライン引数または環境変数からSTRIPE_SECRET_KEYを取得
const stripeSecretKey = process.argv[2] || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEYが指定されていません');
  console.log('💡 実行方法: node scripts/register-webhook.js sk_xxx');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

async function registerWebhook() {
  try {
    console.log('🔧 Webhook エンドポイントを登録中...');

    const endpoint = await stripe.webhookEndpoints.create({
      url: 'https://paintly.pro/api/stripe/webhook',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
      api_version: '2025-02-24.acacia',
      description: 'Paintly Production Webhook',
    });

    console.log('\n✅ Webhook エンドポイントが正常に登録されました！');
    console.log('\n📋 Webhook 情報:');
    console.log('  ID:', endpoint.id);
    console.log('  URL:', endpoint.url);
    console.log('  Status:', endpoint.status);
    console.log('\n🔐 Webhook シークレット:');
    console.log('  ', endpoint.secret);
    console.log('\n📝 次のステップ:');
    console.log('  1. Vercel の環境変数に以下を追加してください:');
    console.log('     STRIPE_WEBHOOK_SECRET=' + endpoint.secret);
    console.log('  2. Vercel をデプロイし直してください');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

registerWebhook();
