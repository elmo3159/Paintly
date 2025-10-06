# タスク完了時のチェックリスト

## 必須確認事項
### 1. コード品質
```bash
npm run lint          # ESLintエラーなし
npm run type-check    # TypeScriptエラーなし
```

### 2. ビルド確認
```bash
npm run build         # ビルド成功確認
```

### 3. テスト実行
```bash
npm run test          # 単体テスト通過
npm run test:e2e      # E2Eテスト通過（必要な場合）
```

### 4. 動作確認
- 開発サーバーでの動作確認
- 主要機能の手動テスト
- レスポンシブデザイン確認

### 5. セキュリティ
- 機密情報の漏洩なし
- 適切な認証・認可
- APIエンドポイントのバリデーション

### 6. パフォーマンス
- Core Web Vitals確認
- 画像最適化
- バンドルサイズ確認

## Git操作
```bash
git add .
git commit -m "feat: 具体的な変更内容"
git push origin main
```

## デプロイ確認
- Vercel自動デプロイ成功
- 本番環境での動作確認