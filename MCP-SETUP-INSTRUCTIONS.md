# MCPサーバー設定復旧手順

## ✅ 完了した作業

MCPサーバーの設定ファイルを更新しました。以下のサーバーを設定済みです：

### 設定済みのMCPサーバー
1. **supabase** - Supabaseデータベース連携 ✅
2. **github** - GitHub連携 ✅  
3. **filesystem** - ファイルシステムアクセス ✅
4. **desktop-commander** - デスクトップ操作 ✅
5. **playwright** - ブラウザ自動化 ✅
6. **cipher** - Cipher AI メモリ管理 ✅

### 未設定のサーバー（追加要件あり）
- **serena** - Pythonが必要（Windows側にPythonがインストールされていません）
- **context7** - 正しいパッケージ名が不明

## 📝 設定ファイルの場所
`C:\Users\elmod\AppData\Roaming\Claude\claude_desktop_config.json`

## 🔄 Claude Desktopを再起動してください

**重要**: 設定を反映させるには、Claude Desktopを完全に再起動する必要があります。

### 再起動手順：
1. Claude Desktopを閉じる（タスクトレイからも終了）
2. タスクマネージャーで`Claude.exe`プロセスが残っていないか確認
3. Claude Desktopを再度起動

## ⚠️ 追加作業が必要な場合

### Serenaを使いたい場合
1. [Python公式サイト](https://www.python.org/downloads/)からPythonをインストール
2. コマンドプロンプトで以下を実行:
   ```cmd
   pip install uv
   uv pip install serena
   ```
3. 設定ファイルに以下を追加:
   ```json
   "serena": {
     "command": "uvx",
     "args": ["serena", "--no-color"]
   }
   ```

### Context7について
正しいパッケージ名またはインストール方法を教えてください。

## 🔍 接続確認方法

Claude Desktopを再起動後、チャット画面で以下のコマンドを実行して確認:
```
/mcp
```

接続されているMCPサーバーのリストが表示されます。

## 📌 重要な注意事項

- Windows環境では`npx.cmd`のフルパス（`C:\Program Files\nodejs\npx.cmd`）を使用する必要があります
- filesystemサーバーにはWindowsパス（`C:\Users\elmod\Desktop\CursorApp`）を指定しています
- GitHubトークンとSupabaseトークンは既存の値を使用しています

## 🚨 トラブルシューティング

もしMCPサーバーが接続できない場合：

1. Node.jsが正しくインストールされているか確認
   ```cmd
   node --version
   npm --version
   ```

2. 必要なパッケージをグローバルインストール
   ```cmd
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-github  
   npm install -g @basehub/supabase-mcp-server
   npm install -g @wonderwhy-er/desktop-commander
   npm install -g @automatalabs/mcp-server-playwright
   npm install -g @cipher-ai/mcp-server
   ```

3. Claude Desktopのログを確認（もし存在する場合）
   `%APPDATA%\Claude\logs\`