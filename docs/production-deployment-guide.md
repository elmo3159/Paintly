# Paintly 本番環境デプロイガイド

**作成日**: 2025年10月10日
**対象**: Vercel本番環境へのStripe Webhook設定

## 📋 前提条件

以下の実装が完了していることを確認してください：
- ✅ `plans`テーブルに`slug`列が追加済み
- ✅ Webhook処理コードが`slug`ベースに更新済み
- ✅ ローカル環境でのテスト完了

## 🎯 本番環境デプロイの流れ

```
1. Stripe Dashboardでwebhookエンドポイント作成
   ↓
2. Webhook Signing Secretを取得
   ↓
3. Vercelに環境変数を設定
   ↓
4. Vercelで再デプロイ
   ↓
5. 本番環境でテスト
```

---

## ステップ1: Stripe Dashboardでのwebhook設定

### 1-1. Stripe Dashboardにアクセス

1. https://dashboard.stripe.com/webhooks にアクセス
2. Stripeアカウントでログイン
3. **Test mode**であることを確認（右上のトグルスイッチ）

### 1-2. Webhookエンドポイントを作成

1. 「**Add endpoint**」ボタンをクリック
2. **Endpoint URL**を入力:
   ```
   https://paintly-pearl.vercel.app/api/stripe-webhook
   ```
   ※ Vercelの実際のデプロイURLを確認してください

3. **Listen to**で「Events on your account」を選択

4. **Select events**で以下のイベントを選択:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. 「**Add endpoint**」をクリック

### 1-3. Webhook Signing Secretをコピー

1. 作成したエンドポイントをクリック
2. 「**Signing secret**」セクションを探す
3. 「**Reveal**」をクリックしてシークレットを表示
4. `whsec_`で始まる文字列をコピー（後で使用）

**重要**: このシークレットは一度しか表示されません。安全な場所に保存してください。

---

## ステップ2: Vercelでの環境変数設定

### 方法A: Vercel Dashboardで設定（推奨）

1. https://vercel.com にアクセス
2. Googleアカウント（elmo.123912@gmail.com）でログイン
3. Paintlyプロジェクトを選択
4. 「**Settings**」タブをクリック
5. 左サイドバーから「**Environment Variables**」を選択
6. 新しい環境変数を追加:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: ステップ1-3でコピーしたシークレット（`whsec_xxx...`）
   - **Environment**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development（オプション）
7. 「**Save**」をクリック

### 方法B: Vercel CLI で設定

```bash
# Vercelにログイン
npx vercel login

# 環境変数を追加（本番環境）
npx vercel env add STRIPE_WEBHOOK_SECRET production

# プロンプトでシークレットを入力
? What's the value of STRIPE_WEBHOOK_SECRET? whsec_xxxxxxxxxxxxxxxxxxxxx

# Preview環境にも追加
npx vercel env add STRIPE_WEBHOOK_SECRET preview
```

---

## ステップ3: 本番環境の他の環境変数を確認

以下の環境変数がVercelに設定されているか確認してください：

### 必須環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S77qRRqfmg5AOGt...
STRIPE_SECRET_KEY=sk_test_51S77qRRqfmg5AOGt...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx  # ← 今回追加

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID=price_1SG0ttRqfmg5AOGtUvrHz5VW
NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID=price_1SG0uMRqfmg5AOGtanMQg2E9
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1SG0uQRqfmg5AOGtgqY1x8i6
NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID=price_1SG0uSRqfmg5AOGtQFVkaNcP

# Gemini API
GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w

# Fal AI
FAL_KEY=b7dbaec1-ba92-4495-8d84-0f39ce6a0ff9:a9b764f4e5d1327ddad7882c48dd658c
```

---

## ステップ4: Vercelで再デプロイ

### 方法A: Vercel Dashboardで再デプロイ

1. Vercel Dashboard → Paintlyプロジェクト
2. 「**Deployments**」タブ
3. 最新のデプロイメントの「**···**」メニュー
4. 「**Redeploy**」を選択
5. 環境変数を含めて再デプロイ

### 方法B: Gitにプッシュして自動デプロイ

```bash
git add .
git commit -m "Add webhook configuration for production"
git push origin main
```

Vercelが自動的に検知して再デプロイします。

---

## ステップ5: 本番環境でのテスト

### 5-1. Webhookエンドポイントのテスト

1. Stripe Dashboard → Webhooks
2. 作成したエンドポイントを選択
3. 「**Send test webhook**」をクリック
4. イベントタイプを選択（例: `checkout.session.completed`）
5. 「**Send test webhook**」を実行

### 5-2. レスポンスの確認

- **成功**: HTTP 200 が返される
- **失敗**: エラーメッセージを確認

### 5-3. Vercelログで確認

1. Vercel Dashboard → Paintlyプロジェクト
2. 「**Logs**」タブ
3. `/api/stripe-webhook`へのリクエストを確認
4. エラーがないことを確認

### 5-4. 実際の支払いフローでテスト

1. 本番環境のアプリにアクセス: https://paintly-pearl.vercel.app
2. テストアカウントでログイン
3. ビリングページに移動
4. プランを選択（例: ライトプラン）
5. Stripe Checkoutでテストカード情報を入力:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: `12/34`
   - CVC: `123`
6. 支払いを完了

### 5-5. データベース更新を確認

```sql
-- Supabaseダッシュボード > SQL Editor で実行
SELECT
  u.email,
  u.plan_id,
  p.name as plan_name,
  p.slug as plan_slug,
  u.stripe_customer_id,
  u.stripe_subscription_id,
  u.subscription_status,
  u.updated_at
FROM users u
LEFT JOIN plans p ON u.plan_id = p.id
WHERE u.email = 'テストユーザーのメール'
ORDER BY u.updated_at DESC;
```

**期待される結果**:
- ✅ `plan_id`が更新されている
- ✅ `plan_slug`が正しい値（例: 'light'）
- ✅ `stripe_subscription_id`が設定されている
- ✅ `subscription_status`が'active'

---

## 🔍 トラブルシューティング

### エラー: "No webhook secret configured"

**原因**: `STRIPE_WEBHOOK_SECRET`が設定されていない

**解決策**:
1. Vercel環境変数を再確認
2. 環境変数が正しい環境（Production/Preview/Development）に設定されているか確認
3. 再デプロイを実行

### エラー: "Invalid signature"

**原因**: Webhook Secretが間違っている、または古い

**解決策**:
1. Stripe DashboardでSigning Secretを再確認
2. Vercelの環境変数を更新
3. 再デプロイ

### エラー: "Plan not found with slug: xxx"

**原因**: データベースの`plans`テーブルに`slug`列がない、または値が設定されていない

**解決策**:
```sql
-- Supabaseダッシュボード > SQL Editor で実行

-- slug列が存在するか確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plans' AND column_name = 'slug';

-- slugが設定されているか確認
SELECT id, name, slug FROM plans;

-- 未設定の場合は設定
UPDATE plans SET slug = 'free' WHERE name = '無料プラン';
UPDATE plans SET slug = 'light' WHERE name = 'ライトプラン';
UPDATE plans SET slug = 'standard' WHERE name = 'スタンダードプラン';
UPDATE plans SET slug = 'pro' WHERE name = 'プロプラン';
UPDATE plans SET slug = 'business' WHERE name = 'ビジネスプラン';
UPDATE plans SET slug = 'forever' WHERE name = '永久プラン';
```

### Webhookイベントが届かない

**確認項目**:
1. Stripe DashboardのWebhookログを確認
2. URLが正しいか確認（https://paintly-pearl.vercel.app/api/stripe-webhook）
3. Test modeとLive modeの設定が一致しているか確認
4. Vercelのデプロイが成功しているか確認

---

## 📊 監視とメンテナンス

### 定期的な確認事項

**毎日**:
- Vercel Logsでエラーがないか確認

**毎週**:
- Stripe Dashboardでwebhookの成功率を確認
- 失敗したイベントを確認・再送信

**毎月**:
- Webhook Secretのローテーション（セキュリティ向上）

### Webhook Secretのローテーション手順

1. Stripe Dashboardで新しいエンドポイントを作成
2. 新しいSigning Secretを取得
3. Vercelの環境変数を更新
4. 再デプロイ
5. 新しいエンドポイントをテスト
6. 問題なければ古いエンドポイントを削除

---

## ✅ チェックリスト

デプロイ前に以下を確認してください：

- [ ] ローカル環境でStripe CLIを使ってwebhookテスト完了
- [ ] `plans`テーブルに`slug`列が存在
- [ ] 全プランに`slug`値が設定済み
- [ ] Webhook処理コードが`slug`ベースに更新済み
- [ ] Stripe Dashboardでwebhookエンドポイント作成完了
- [ ] Webhook Signing Secretを取得済み
- [ ] Vercelに`STRIPE_WEBHOOK_SECRET`環境変数を設定
- [ ] Vercelで再デプロイ完了
- [ ] Stripe Dashboardでテストwebhook送信成功
- [ ] Vercel Logsでエラーがないことを確認
- [ ] 実際の支払いフローでエンドツーエンドテスト完了
- [ ] データベースが自動更新されることを確認

---

## 📚 参考資料

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## 🆘 サポート

問題が解決しない場合：
1. このドキュメントのトラブルシューティングセクションを確認
2. Vercel Logsで詳細なエラーメッセージを確認
3. Stripe DashboardのWebhook logsを確認
4. 実装ドキュメント（`docs/implementation-improvements-2025-10-10.md`）を参照

---

**作成者**: Claude Code
**最終更新**: 2025年10月10日
