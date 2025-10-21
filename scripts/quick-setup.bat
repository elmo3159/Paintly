@echo off
echo ========================================
echo Vercel 環境変数追加スクリプト
echo ========================================
echo.
echo このスクリプトは以下を自動実行します：
echo 1. Vercel CLIでログイン（ブラウザが開きます）
echo 2. 環境変数 STRIPE_WEBHOOK_SECRET を追加
echo.
echo 準備ができたらEnterキーを押してください...
pause > nul

echo.
echo [1/3] Vercel にログイン中...
echo ブラウザが開きます。Googleアカウントでログインしてください。
echo.
cmd /c vercel login

echo.
echo [2/3] 環境変数を追加中（Production）...
echo whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9 | cmd /c vercel env add STRIPE_WEBHOOK_SECRET production

echo.
echo [3/3] 環境変数を追加中（Preview）...
echo whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9 | cmd /c vercel env add STRIPE_WEBHOOK_SECRET preview

echo.
echo [4/4] 環境変数を追加中（Development）...
echo whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9 | cmd /c vercel env add STRIPE_WEBHOOK_SECRET development

echo.
echo ========================================
echo ✅ 完了！
echo ========================================
echo.
echo Vercel が自動的に再デプロイを開始します。
echo デプロイ完了後、Stripe Webhook が動作します。
echo.
pause
