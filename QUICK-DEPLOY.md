# 🚀 Paintly クイックデプロイガイド

## 即座にデプロイする手順（5分で完了）

### 1️⃣ GitHubへプッシュ（1分）
```bash
git init
git add .
git commit -m "Initial commit: Paintly v1.0.0"
gh repo create paintly --public --push
```

### 2️⃣ Vercelでインポート（2分）
1. https://vercel.com/new へアクセス
2. GitHubリポジトリ「paintly」を選択
3. 環境変数を追加:
```
NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk
GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
4. 「Deploy」をクリック

### 3️⃣ データベース設定（2分）
1. [Supabase SQLエディタ](https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm/sql)を開く
2. `create-generations-table.sql`の内容をコピペして実行

## ✅ 完了！

アプリケーションURL: `https://paintly.vercel.app`

## オプション: Stripe設定（後で実施可）

### 本番用Stripeキー設定
1. [Stripe Dashboard](https://dashboard.stripe.com)で本番キー取得
2. Vercel環境変数を更新:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Webhook設定
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://paintly.vercel.app/api/stripe-webhook`
3. Events: 
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
4. Signing secretをVercel環境変数に追加:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📱 動作確認

1. ✅ サインアップ/サインイン
2. ✅ 顧客ページ作成
3. ✅ 画像アップロード
4. ✅ カラーシミュレーション生成
5. ✅ PWAインストール

## 🎉 デプロイ完了！

問題が発生した場合は`DEPLOYMENT.md`のトラブルシューティングを参照してください。