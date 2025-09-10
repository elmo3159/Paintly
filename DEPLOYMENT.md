# Paintly デプロイメントガイド

## 📋 事前準備

### 必要なアカウント
- [ ] Vercelアカウント
- [ ] Supabaseアカウント
- [ ] Google Cloud Platform (Gemini API)
- [ ] Stripeアカウント

### 環境変数の準備
以下の環境変数を事前に取得してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini API
GEMINI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

## 🚀 Vercelへのデプロイ手順

### 1. プロジェクトのインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. 「Paintly」リポジトリを選択

### 2. 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：

#### Production環境変数
```
NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Stripe環境変数（本番用）
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. ビルド設定

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`
- **Node.js Version**: 18.x

### 4. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイ完了を待つ（約2-3分）

## 🗄️ Supabaseセットアップ

### 1. データベース初期化

```sql
-- プランデータの投入
INSERT INTO plans (id, name, price_monthly, generation_limit, customer_limit, storage_days, features, description, sort_order, is_active)
VALUES 
  (gen_random_uuid(), '無料プラン', 0, 3, 3, 7, '["生成回数: 3回まで", "顧客ページ: 3件まで", "画像保存期間: 7日間"]', 'お試し利用', 1, true),
  (gen_random_uuid(), 'ライトプラン', 2980, 30, 999, 30, '["生成回数: 30回/月", "顧客ページ: 無制限", "画像保存期間: 1ヶ月"]', '週1-2件の営業', 2, true),
  (gen_random_uuid(), 'スタンダードプラン', 5980, 100, 999, 90, '["生成回数: 100回/月", "顧客ページ: 無制限", "画像保存期間: 3ヶ月"]', '週3-5件の営業', 3, true),
  (gen_random_uuid(), 'プロプラン', 9980, 300, 999, 180, '["生成回数: 300回/月", "顧客ページ: 無制限", "画像保存期間: 6ヶ月"]', '毎日の営業', 4, true),
  (gen_random_uuid(), 'ビジネスプラン', 19800, 1000, 999, 365, '["生成回数: 1,000回/月", "顧客ページ: 無制限", "画像保存期間: 1年間"]', '複数営業担当', 5, true);
```

### 2. Storage Buckets作成

Supabase Dashboardから：
1. Storage → New bucket
2. 以下のバケットを作成：
   - `images` (Public, 10MB limit)
   - `generations` (Public, 10MB limit)

### 3. RLSポリシー確認

すべてのテーブルでRLSが有効になっていることを確認

## 💳 Stripe設定

### 1. 商品作成

Stripe Dashboardで商品を作成：
1. Products → Add product
2. 各プランの商品を作成
3. Price IDを環境変数に設定

### 2. Webhook設定

1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3. Webhook Secretを環境変数に追加

## 🔍 デプロイ後の確認

### 1. 基本動作確認
- [ ] トップページが表示される
- [ ] サインアップ/サインインができる
- [ ] ダッシュボードが表示される
- [ ] 顧客ページが作成できる

### 2. 画像生成確認
- [ ] 画像アップロードができる
- [ ] 色選択が動作する
- [ ] シミュレーション生成が動作する（Gemini API）

### 3. 決済確認
- [ ] 料金プランページが表示される
- [ ] Stripe Checkoutが開く
- [ ] サブスクリプションが作成される

### 4. PWA確認
- [ ] Service Workerが登録される
- [ ] オフライン時にオフラインページが表示される
- [ ] インストールプロンプトが表示される

## 🚨 トラブルシューティング

### ビルドエラー

```bash
# 依存関係の問題
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 環境変数が読み込まれない
- Vercelダッシュボードで環境変数を設定後、再デプロイが必要
- Development/Preview/Production環境ごとに設定

### Supabase接続エラー
- URLとAPIキーが正しいか確認
- RLSポリシーが適切に設定されているか確認

### Stripe Webhookエラー
- Webhook Secretが正しいか確認
- エンドポイントURLが正しいか確認

## 📊 監視とメンテナンス

### Vercel Analytics
- Web Vitalsの監視
- エラー率の確認

### Supabase Dashboard
- データベース使用量
- API使用量
- ストレージ使用量

### Stripe Dashboard
- 決済成功率
- サブスクリプション状況
- 売上レポート

## 🔄 アップデート手順

1. ローカルで変更をテスト
2. GitHubにプッシュ
3. Vercelが自動デプロイ
4. デプロイ完了を確認

## 📝 チェックリスト

### デプロイ前
- [ ] 環境変数の設定完了
- [ ] データベーステーブル作成完了
- [ ] ストレージバケット作成完了
- [ ] Stripe商品設定完了

### デプロイ後
- [ ] 全機能の動作確認
- [ ] セキュリティヘッダーの確認
- [ ] パフォーマンステスト
- [ ] モバイル動作確認

## 🆘 サポート

問題が発生した場合：
1. Vercelのビルドログを確認
2. Supabaseのログを確認
3. ブラウザのコンソールエラーを確認
4. [GitHub Issues](https://github.com/your-username/paintly/issues)で報告

---

最終更新: 2025年1月