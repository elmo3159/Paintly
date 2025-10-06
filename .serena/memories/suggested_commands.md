# Paintly 開発コマンド集

## 開発サーバー
```bash
npm run dev              # 開発サーバー起動 (localhost:3000)
npm run dev -- -p 9090  # 指定ポートで開発サーバー起動
```

## ビルド・デプロイ
```bash
npm run build           # 本番ビルド作成
npm run start           # 本番サーバー起動
npm run lint            # ESLint実行
npm run type-check      # TypeScript型チェック
```

## テスト
```bash
npm run test            # Jest単体テスト実行
npm run test:e2e        # Playwright E2Eテスト実行
npm run test:coverage   # カバレッジ付きテスト実行
```

## タスク完了時の確認コマンド
```bash
npm run lint            # コード品質チェック
npm run type-check      # 型エラーチェック
npm run build           # ビルド確認
npm run test            # テスト実行
```

## Git操作
```bash
git status              # 変更状況確認
git add .               # ステージング
git commit -m "message" # コミット
git push                # プッシュ
```

## システムコマンド (Linux)
```bash
ls -la                  # ファイル一覧表示
find . -name "*.tsx"    # ファイル検索
grep -r "pattern" .     # テキスト検索
ps aux | grep node      # プロセス確認
```