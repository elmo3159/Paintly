# Supabase認証設定の修正手順

## 問題
Googleログイン後に`paintly.app`（間違ったドメイン）にリダイレクトされてしまう

## 原因
SupabaseダッシュボードのSite URLが`https://paintly.app`に設定されている

## 解決方法

### 1. Supabaseダッシュボードで設定を変更

1. [Supabaseダッシュボード](https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm)にアクセス
2. **Authentication** → **URL Configuration**を開く
3. 以下の設定を変更:

#### Site URL
```
変更前: https://paintly.app
変更後: https://paintly.vercel.app
```

#### Redirect URLs
以下のURLを追加:
```
https://paintly.vercel.app/**
https://paintly.vercel.app/auth/callback
```

### 2. Google OAuth設定の確認

1. **Authentication** → **Providers** → **Google**を確認
2. **Authorized redirect URIs**に以下が設定されているか確認:
   - `https://mockfjcakfzbzccabcgm.supabase.co/auth/v1/callback`

### 3. Vercel環境変数の更新

Vercelダッシュボードで以下を確認:

```
NEXT_PUBLIC_APP_URL=https://paintly.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[既存の値]
SUPABASE_SERVICE_ROLE_KEY=[既存の値]
GEMINI_API_KEY=[既存の値]
```

### 4. Google Cloud Consoleの確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. OAuth 2.0クライアントIDの設定を確認
3. **Authorized redirect URIs**に以下が含まれているか確認:
   - `https://mockfjcakfzbzccabcgm.supabase.co/auth/v1/callback`

## 確認手順

1. 上記の設定を完了後、ブラウザのキャッシュをクリア
2. `https://paintly.vercel.app/auth/signin`にアクセス
3. Googleログインボタンをクリック
4. 正常に`https://paintly.vercel.app/dashboard`にリダイレクトされることを確認

## 重要な注意点

- **paintly.app**は別のドメインなので使用しない
- 正しいURLは**paintly.vercel.app**
- プレビューデプロイメントURL（ハッシュ付き）は使用しない