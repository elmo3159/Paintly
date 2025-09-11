# 🚨 緊急設定手順 - 必ず確認してください

## 問題の修正完了

✅ **コード修正済み**:
- データベーステーブル名を修正（customers → customer_pages、generation_history → generations）
- エラーハンドリングを改善（詳細なログ出力）
- `.single()` を `.maybeSingle()` に変更（エラー回避）

## 📋 今すぐ必要な設定（3つのステップ）

### ステップ1: Vercel環境変数の設定 ⚡

[Vercelダッシュボード](https://vercel.com/elmos-projects-cf77d205/paintly/settings/environment-variables)にアクセスして、以下の環境変数を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://paintly-pearl.vercel.app` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mockfjcakfzbzccabcgm.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk` | Production, Preview, Development |
| `GEMINI_API_KEY` | `AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w` | Production, Preview, Development |

### ステップ2: SupabaseのURL設定 🔐

[Supabaseダッシュボード](https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm/auth/url-configuration)にアクセス：

1. **Site URL**を変更:
   ```
   https://paintly-pearl.vercel.app
   ```

2. **Redirect URLs**に以下を追加:
   ```
   https://paintly-pearl.vercel.app/**
   https://paintly-pearl.vercel.app/auth/callback
   ```

### ステップ3: Vercelで再デプロイ 🚀

1. [Vercelダッシュボード](https://vercel.com/elmos-projects-cf77d205/paintly)にアクセス
2. 最新のデプロイメントの「...」メニューをクリック
3. **Redeploy**をクリック
4. **Use existing Build Cache?** のチェックを**外して**再デプロイ

## ✅ 確認チェックリスト

- [ ] Vercelで5つの環境変数すべてが設定されている
- [ ] SupabaseのSite URLが`https://paintly-pearl.vercel.app`になっている
- [ ] SupabaseのRedirect URLsに正しいURLが追加されている
- [ ] Vercelで最新のコミット（5accb23以降）がデプロイされている
- [ ] デプロイのStatusが「Ready」になっている

## 🔍 テスト手順

1. ブラウザのキャッシュとCookieをクリア
2. `https://paintly-pearl.vercel.app/auth/signin`にアクセス
3. Googleログインボタンをクリック
4. 正常に`https://paintly-pearl.vercel.app/dashboard`にリダイレクトされることを確認

## ⚠️ よくある問題と解決策

### 問題1: まだログインできない
**解決策**: Vercelのログを確認して、どのエラーが発生しているか確認してください。
- Vercel → Functions → Logsタブで詳細なエラーログが見れます

### 問題2: 「エラーが発生しました」ページが表示される
**解決策**: 環境変数が正しく設定されているか再確認してください。特に`NEXT_PUBLIC_APP_URL`が重要です。

### 問題3: 古いバージョンがデプロイされている
**解決策**: Vercelで手動で再デプロイしてください（Build Cacheを使わずに）。

## 📞 サポート

問題が解決しない場合は、以下の情報を教えてください：
1. Vercelのデプロイメントログ
2. ブラウザのコンソールエラー
3. Network タブでのリクエスト/レスポンス