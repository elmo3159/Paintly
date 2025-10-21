# Vercel APIトークン生成ガイド

現在のトークンには環境変数の書き込み権限がありません。
新しいトークンを生成して自動化を完了させましょう。

## 🔑 新しいトークン生成手順（30秒で完了）

### 1. Vercel Settings を開く
```
https://vercel.com/account/tokens
```

### 2. "Create Token" をクリック

### 3. トークン設定
- **Token Name**: `Paintly Deployment`
- **Scope**:
  - ✅ Full Account
  または
  - ✅ Select Teams → `elmodayo3159s-projects` を選択
- **Expiration**: `No Expiration` または `90 Days`

### 4. "Create" をクリック

### 5. トークンをコピー
- 表示されたトークンをコピー（例: `vercel_abc123...`）
- **重要**: このトークンは一度しか表示されません

---

## 🚀 自動実行コマンド

トークンを生成したら、以下のコマンドを実行してください：

```powershell
# トークンを環境変数に設定
$env:NEW_VERCEL_TOKEN = "ここに新しいトークンを貼り付け"

# 自動追加スクリプトを実行
node scripts/add-vercel-env.js $env:NEW_VERCEL_TOKEN whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9
```

または、PowerShellスクリプトを直接編集：

```powershell
# scripts/add-vercel-env.ps1 の1行目を変更
$VERCEL_TOKEN = "ここに新しいトークンを貼り付け"

# 実行
powershell -ExecutionPolicy Bypass -File scripts/add-vercel-env.ps1
```

---

## 🎯 簡単な代替方法

もし今すぐトークンを生成できない場合は、以下の手動方法が最速です（60秒）：

### Vercelダッシュボード
```
https://vercel.com/elmodayo3159s-projects/paintly-front/settings/environment-variables
```

1. "Add New" をクリック
2. Key: `STRIPE_WEBHOOK_SECRET`
3. Value: `whsec_dPz9BbOirfT7uUegYNlpXQfyYGuSmHd9`
4. Environment: Production, Preview, Development すべてチェック
5. "Save" をクリック

→ 完了！Vercelが自動的に再デプロイします 🚀
