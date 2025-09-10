# Google認証設定ガイド

## Supabaseでの設定手順

### 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm

### 2. Authentication設定を開く
左メニューから「Authentication」→「Providers」をクリック

### 3. Googleプロバイダーを有効化
1. 「Google」を見つけてクリック
2. 「Enable Google provider」をONにする

### 4. Google Cloud Consoleで認証情報を作成
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」をクリック
4. 「認証情報を作成」→「OAuth クライアント ID」を選択
5. アプリケーションの種類：「ウェブアプリケーション」を選択
6. 名前：「Paintly」と入力
7. 承認済みのリダイレクトURI：
   ```
   https://mockfjcakfzbzccabcgm.supabase.co/auth/v1/callback
   ```
8. 「作成」をクリック

### 5. クライアントIDとシークレットをSupabaseに設定
Google Cloud Consoleで取得した：
- **クライアントID**
- **クライアントシークレット**

これらをSupabaseの設定画面に貼り付けて「Save」

### 6. Vercelの環境変数確認
Vercelにデプロイ済みの環境変数が正しく設定されているか確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 7. アプリケーションのURLを確認
正しいURLでアクセス：
- **本番環境**: https://paintly-elmo.vercel.app
- **サインイン**: https://paintly-elmo.vercel.app/auth/signin
- **サインアップ**: https://paintly-elmo.vercel.app/auth/signup

## トラブルシューティング

### Googleログイン後にリダイレクトされない場合
1. SupabaseダッシュボードでSite URLを確認
   - Authentication → URL Configuration
   - Site URL: `https://paintly-elmo.vercel.app`
   - Redirect URLs: `https://paintly-elmo.vercel.app/**`

2. Google Cloud ConsoleでリダイレクトURIを確認
   - 承認済みのリダイレクトURIが正しく設定されているか

### エラー: redirect_uri_mismatch
- Google Cloud ConsoleのリダイレクトURIとSupabaseのコールバックURLが一致していることを確認

### その他の問題
- ブラウザのキャッシュをクリア
- シークレットモードで試す
- コンソールログでエラーを確認