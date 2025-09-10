# 🚀 Paintly - 今すぐデプロイする手順

## Vercelにデプロイ（3分で完了）

### 📌 必要な情報
- **Vercelアカウント**: ✅ 作成済み (elmo.123912@gmail.com)
- **コード**: ✅ 準備完了
- **Git**: ✅ 初期化済み

## 🎯 デプロイ手順

### 方法1: Vercel Webインターフェース（推奨）

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - Googleアカウント (elmo.123912@gmail.com) でログイン

2. **新しいプロジェクトを作成**
   - 「New Project」ボタンをクリック
   - 「Import Git Repository」セクションで「Import Third-Party Git Repository」を選択
   - 以下のパスを入力:
   ```
   /mnt/c/Users/elmod/Desktop/CursorApp/Paintly
   ```
   
   または「Upload」タブを選択して、Paintlyフォルダ全体をドラッグ&ドロップ

3. **環境変数を設定**
   プロジェクト設定で以下の環境変数を追加:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk
   GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w
   NEXT_PUBLIC_APP_URL=https://[your-project-name].vercel.app
   ```

4. **デプロイ実行**
   - 「Deploy」ボタンをクリック
   - 約2-3分でデプロイ完了

### 方法2: GitHubを経由（代替案）

1. **GitHubにプッシュ**
   ```bash
   # GitHubリポジトリを作成
   gh repo create paintly --public --source=.
   git push -u origin master
   ```

2. **VercelでGitHubリポジトリをインポート**
   - Vercel Dashboard → New Project
   - GitHubアカウントを連携
   - paintlyリポジトリを選択
   - 環境変数を設定
   - Deploy

## 📱 デプロイ完了後

### アクセスURL
```
https://paintly-[ランダム文字列].vercel.app
```

### 動作確認項目
1. ✅ トップページの表示
2. ✅ サインアップ/サインイン
3. ✅ 顧客ページ作成
4. ✅ 画像アップロード
5. ✅ カラーシミュレーション

## ⚠️ 重要: データベース設定

デプロイ後、Supabaseダッシュボードで以下のSQLを実行:

1. **Supabase SQLエディタを開く**
   https://supabase.com/dashboard/project/mockfjcakfzbzccabcgm/sql

2. **generations テーブルを作成**
   `create-generations-table.sql`の内容をコピー&ペーストして実行

## 🎉 完了！

デプロイが成功したら、提供されたURLでアプリケーションにアクセスできます。

### トラブルシューティング

**ビルドエラーが発生した場合:**
- Node.jsバージョンを18.xに設定
- package.jsonの依存関係を確認

**環境変数エラー:**
- すべての環境変数が正しく設定されているか確認
- NEXT_PUBLIC_で始まる変数は再ビルドが必要

---

## 現在のプロジェクト状況

- ✅ コード: 100%完成
- ✅ Git: 初期化・コミット済み
- ✅ 環境変数: 準備完了
- ⏳ デプロイ: 実行待ち

**今すぐVercelダッシュボードにアクセスして、デプロイを開始してください！**

https://vercel.com/dashboard