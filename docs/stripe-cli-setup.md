# Stripe CLI セットアップガイド

## Windows環境でのインストール

### 方法1: Scoop経由（推奨）

```powershell
# Scoopがインストールされていない場合
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Stripe CLIをインストール
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### 方法2: 手動インストール

1. [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest)から最新版をダウンロード
2. `stripe_X.X.X_windows_x86_64.zip`を解凍
3. `stripe.exe`をパスに追加（例: `C:\Program Files\stripe\`）

## ローカル開発環境でのWebhook設定

### 1. Stripeにログイン

```bash
stripe login
```

ブラウザが開き、Stripeダッシュボードでログインを確認します。

### 2. Webhookイベントをローカルに転送

```bash
# 開発サーバーを起動（別ターミナル）
npm run dev

# Webhookを転送（新しいターミナル）
stripe listen --forward-to localhost:3005/api/stripe-webhook
```

### 3. Webhook Secretを取得

コマンド実行後、以下のような出力が表示されます：

```
> Ready! You are using Stripe API Version [2025-02-24]
> Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 4. 環境変数に設定

`.env.local`ファイルに追加：

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 5. サーバーを再起動

環境変数を読み込むため、Next.jsサーバーを再起動します：

```bash
# Ctrl+C で停止後
npm run dev
```

## Webhookのテスト

### テストイベントを送信

```bash
# 新しいターミナルで実行
stripe trigger checkout.session.completed
```

### ログ確認

`stripe listen`を実行しているターミナルでイベント受信を確認：

```
2025-01-10 12:34:56 --> checkout.session.completed [evt_xxxxx]
2025-01-10 12:34:56 <-- [200] POST http://localhost:3005/api/stripe-webhook [evt_xxxxx]
```

## 本番環境への設定

### Vercel環境変数

Vercelダッシュボードで以下を設定：

1. Settings → Environment Variables
2. `STRIPE_WEBHOOK_SECRET` を追加
3. Stripe Dashboardで取得したシークレット（`whsec_`で始まる）を設定

### Stripe Dashboard設定

1. [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. 「Add endpoint」をクリック
3. エンドポイントURL: `https://your-domain.vercel.app/api/stripe-webhook`
4. イベント選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Signing secretをコピーして環境変数に設定

## トラブルシューティング

### Webhookが動作しない場合

```bash
# ログを確認
stripe listen --forward-to localhost:3005/api/stripe-webhook --print-json

# 特定のイベントのみ受信
stripe listen --events checkout.session.completed --forward-to localhost:3005/api/stripe-webhook
```

### よくあるエラー

**Error: No such webhook endpoint**
- `.env.local`の`STRIPE_WEBHOOK_SECRET`が正しいか確認
- サーバーを再起動したか確認

**Error: Invalid signature**
- Webhook Secretが最新か確認（`stripe listen`を再実行すると新しいシークレットが生成される）

**Error: Cannot connect to localhost**
- 開発サーバーが起動しているか確認
- ポート番号が正しいか確認
