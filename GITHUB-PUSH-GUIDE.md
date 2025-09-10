# 🚀 GitHubへのプッシュ方法

## 現在の状況
- ✅ GitHubリポジトリ作成済み: https://github.com/elmo3159/paintly.git
- ✅ ローカルGitリポジトリ準備完了
- ⚠️ GitHub認証が必要

## 📌 推奨: 以下の3つの方法から選択

### 方法1: Windows側のGit Bashを使用（最も簡単）

Windows側でGit Bashまたは PowerShellを開いて実行：

```bash
# Paintlyフォルダに移動
cd C:\Users\elmod\Desktop\CursorApp\Paintly

# GitHubにプッシュ（認証画面が自動的に開きます）
git push -u origin main
```

認証画面でGitHubアカウントでログインすればプッシュ完了！

### 方法2: GitHub Personal Access Token (PAT) を使用

1. **GitHub PATを作成**
   - https://github.com/settings/tokens/new
   - Note: `Paintly WSL Access`
   - Expiration: 30 days（または好きな期間）
   - Scopes: `repo` にチェック
   - 「Generate token」をクリック
   - **トークンをコピー**（一度しか表示されません！）

2. **WSLでプッシュ**
   ```bash
   # URLにトークンを含めてプッシュ
   git push https://[YOUR_TOKEN]@github.com/elmo3159/paintly.git main
   ```

### 方法3: GitHub Desktopを使用（GUI）

1. **GitHub Desktopをダウンロード**
   - https://desktop.github.com/

2. **リポジトリを追加**
   - File → Add Local Repository
   - `C:\Users\elmod\Desktop\CursorApp\Paintly` を選択

3. **Publishボタンをクリック**

## 🎯 プッシュ後の手順

### GitHubでプッシュを確認
https://github.com/elmo3159/paintly

コードが表示されれば成功！

### Vercelでインポート

1. **Vercelダッシュボード**
   - https://vercel.com/new

2. **paintlyリポジトリが表示される**
   - 「Import」をクリック

3. **環境変数を設定**
   
   以下をコピー＆ペーストして追加：

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://mockfjcakfzbzccabcgm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk
   GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w
   NEXT_PUBLIC_APP_URL=https://paintly.vercel.app
   ```

4. **Deploy をクリック**

## ✅ 成功後の自動デプロイ

一度設定が完了すれば、私が以下を実行するだけで自動デプロイ：

```bash
git add .
git commit -m "Update: 機能修正"
git push
```

## 📝 補足: WSLでGit認証を永続化

将来のために、WSLでGitHub認証を設定する場合：

```bash
# Git Credential Manager をインストール
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"

# または、トークンをキャッシュ
git config --global credential.helper store
```

---

## 🚀 今すぐやること

**最も簡単な方法1を推奨**:

1. Windowsで PowerShell または Git Bash を開く
2. `cd C:\Users\elmod\Desktop\CursorApp\Paintly`
3. `git push -u origin main`
4. GitHub認証画面でログイン
5. Vercelに戻ってインポート！