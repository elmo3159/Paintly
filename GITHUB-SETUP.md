# 🚀 GitHub → Vercel デプロイ手順

## 📌 ステップ1: GitHubでリポジトリ作成

### ブラウザで以下を実行:

1. **GitHubにアクセス**
   - https://github.com/new
   - ログイン済みのアカウントで

2. **新しいリポジトリを作成**
   - Repository name: `paintly`
   - Description: `AI-powered painting simulation tool for painting companies`
   - Public/Private: どちらでもOK（PublicまたはPrivate）
   - **重要**: 「Initialize this repository with:」のチェックは全て外す
   - 「Create repository」をクリック

3. **作成後に表示されるURLをコピー**
   - 例: `https://github.com/[your-username]/paintly.git`
   - このURLを以下のコマンドで使用します

## 📌 ステップ2: GitHubにプッシュ（私が実行）

リポジトリURLを教えていただければ、以下のコマンドを実行します：

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/[your-username]/paintly.git

# mainブランチに変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

## 📌 ステップ3: Vercelでインポート

1. **Vercelダッシュボードに戻る**
   - https://vercel.com/new

2. **GitHubリポジトリが表示される**
   - 「Import Git Repository」セクションに`paintly`が表示されます
   - 「Import」ボタンをクリック

3. **環境変数を設定**

| Variable Name | Value |
|--------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | `https://mockfjcakfzbzccabcgm.supabase.co` |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM` |
| SUPABASE_SERVICE_ROLE_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk` |
| GEMINI_API_KEY | `AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w` |

4. **Deploy をクリック**
   - 2-3分でデプロイ完了

## ✅ 完了後の自動デプロイ

以降は、私が以下を実行するだけで自動デプロイされます：

```bash
git add .
git commit -m "Update: 機能追加/修正"
git push
```

## 🔄 今すぐ始めましょう！

1. **まず、GitHubで「paintly」リポジトリを作成してください**
   - https://github.com/new

2. **作成後、表示されるリポジトリURLを教えてください**
   - 例: `https://github.com/[your-username]/paintly.git`

3. **私がプッシュします**

---

**注意**: GitHubのユーザー名が必要です。リポジトリ作成後に表示されるURLをそのままコピペしてください。