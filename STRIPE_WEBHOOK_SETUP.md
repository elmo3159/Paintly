# Stripe Webhook セットアップ完了ガイド

## ✅ 完了した作業

### 1. Stripe Webhookエンドポイント登録 ✅
以下の情報でStripeにWebhookエンドポイントが正常に登録されました：

- **Webhook ID**: `we_1SK0JxRu4QwuualpkjSnqqW0`
- **URL**: `https://paintly.pro/api/stripe/webhook`
- **Status**: `enabled` ✅
- **監視イベント**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 2. Webhookシークレット取得 ✅
```
whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9
```

### 3. ローカル環境変数更新 ✅
`.env.local`ファイルに`STRIPE_WEBHOOK_SECRET`を追加済み

---

## 🔧 残りの作業: Vercel環境変数の追加

Vercel本番環境でWebhookを動作させるには、環境変数の追加が必要です。

### 方法1: Vercelダッシュボード（推奨）

1. **Vercelダッシュボードを開く**
   https://vercel.com/elmodayo3159s-projects/paintly-front/settings/environment-variables

2. **環境変数を追加**
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9`
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック ✅

3. **保存してデプロイ**
   - 「Save」をクリック
   - Vercelが自動的に再デプロイを開始します

### 方法2: Vercel CLI（代替）

PowerShellの実行ポリシーを一時的に変更して実行：

```powershell
# 実行ポリシーを一時的に変更
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 環境変数を追加
vercel env add STRIPE_WEBHOOK_SECRET production
# 値を入力: whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9

vercel env add STRIPE_WEBHOOK_SECRET preview
# 値を入力: whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9

vercel env add STRIPE_WEBHOOK_SECRET development
# 値を入力: whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9
```

---

## 🧪 動作確認方法

環境変数追加後、以下で動作を確認できます：

### 1. Stripeダッシュボードでテスト
https://dashboard.stripe.com/webhooks/we_1SK0JxRu4QwuualpkjSnqqW0

- 「Send test webhook」をクリック
- `checkout.session.completed`を選択
- エンドポイントが正常に応答することを確認（200 OK）

### 2. 実際の決済フローでテスト
1. `https://paintly.pro/pricing`にアクセス
2. プランを選択してCheckoutに進む
3. テストカード番号: `4242 4242 4242 4242` (Stripe Test Mode)
4. 決済完了後、Supabaseの`subscriptions`テーブルにレコードが作成されることを確認

### 3. Webhookイベントログ確認
Stripeダッシュボード → Webhooks → `we_1SK0JxRu4QwuualpkjSnqqW0` → Logs

---

## 📋 実装済みのWebhook処理内容

`app/api/stripe/webhook/route.ts`で以下が実装済み：

### `checkout.session.completed`
- Checkout Session完了時
- ユーザーのサブスクリプション情報をSupabaseに保存
- Stripe Customer IDを`users`テーブルに保存

### `customer.subscription.created/updated`
- サブスクリプション作成・更新時
- プラン情報、ステータス、期間などをSupabaseに同期

### `customer.subscription.deleted`
- サブスクリプションキャンセル時
- ステータスを`canceled`に更新

### `invoice.payment_succeeded`
- 請求成功時（月次更新）
- `generation_count`を0にリセット

### `invoice.payment_failed`
- 請求失敗時
- ステータスを`past_due`に更新

---

## 🎉 完了後の確認事項

- ✅ Stripe Webhookエンドポイントが登録されている
- ✅ Webhookシークレットが取得されている
- ✅ ローカル環境変数が更新されている
- ⏳ Vercel本番環境変数の追加（あなたが実行）
- ⏳ Vercel再デプロイ（自動）
- ⏳ Webhook動作テスト（デプロイ後）

すべて完了すれば、Paintlyの決済システムが完全に稼働します！ 🚀
