# Paintly コーディング規約

## TypeScript設定
- `strict: true` - 厳格な型チェック
- ES2017ターゲット
- Path alias: `@/*` でルートディレクトリ参照

## ファイル構造
```
app/                 # Next.js App Router
├── api/            # API Routes
├── auth/           # 認証ページ
├── customer/       # 顧客管理
└── dashboard/      # ダッシュボード
components/         # 再利用可能コンポーネント
├── ui/            # shadcn/ui基盤コンポーネント
lib/               # ユーティリティ・設定
types/             # 型定義
hooks/             # カスタムフック
store/             # 状態管理
```

## 命名規約
- ファイル: kebab-case (`color-selector.tsx`)
- コンポーネント: PascalCase (`ColorSelector`)
- 変数・関数: camelCase (`handleGenerate`)
- 定数: UPPER_SNAKE_CASE (`GEMINI_API_KEY`)

## コード品質
- ESLint + Prettier設定済み
- 本番環境でconsole.log自動削除
- 型安全性重視
- モバイルファースト設計