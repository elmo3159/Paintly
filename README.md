# Paintly（ペイントリー）

塗装会社向けAIカラーチェンジツール - 営業現場で即座に塗装後の仕上がりをシミュレーション

![Next.js](https://img.shields.io/badge/Next.js-14%2F15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange)

## 🎨 概要

Paintlyは、塗装会社の営業担当者が顧客宅を訪問した際に、その場で建物の写真を撮影し、AIを使用して瞬時に塗装後の仕上がり画像を生成・提示するSaaSツールです。

### 主な特徴

- 📱 **モバイルファースト設計** - スマートフォンでの利用に最適化
- 🚀 **高速画像生成** - Gemini AIによる即座のシミュレーション
- 🎯 **簡単操作** - 写真撮影と色選択だけのシンプルUI
- 📊 **ビフォーアフター比較** - スライダーで直感的に比較
- 💳 **柔軟な料金プラン** - 無料から法人向けまで5つのプラン

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0以上
- npm または yarn
- Supabaseアカウント
- Google AI Studio APIキー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/paintly.git
cd paintly

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

### 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 でアクセス可能
```

### ビルド

```bash
npm run build
npm run start
```

## 🛠 技術スタック

### フロントエンド
- **Next.js 14/15** - App Router使用
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - UIコンポーネントライブラリ
- **Zustand** - 状態管理

### バックエンド
- **Next.js API Routes** - APIエンドポイント
- **Supabase** - データベース＆認証
- **Gemini AI** - 画像生成AI
- **Stripe** - 決済処理

### インフラ
- **Vercel** - ホスティング
- **Cloudflare R2** - 画像ストレージ
- **Cloudflare Workers** - エッジ処理

## 📁 プロジェクト構造

```
paintly/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # ダッシュボード
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── ui/               # UIコンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                   # ユーティリティ関数
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
├── public/               # 静的ファイル
└── .claude/              # 知見管理システム
    ├── context.md        # プロジェクトコンテキスト
    ├── project-knowledge.md  # 技術的知見
    ├── project-improvements.md # 改善履歴
    ├── common-patterns.md    # 共通パターン
    └── debug-log.md          # デバッグログ
```

## 💰 料金プラン

| プラン | 月額 | 生成回数 | 保存期間 |
|--------|------|----------|----------|
| 無料 | ¥0 | 3回 | 7日間 |
| ライト | ¥2,980 | 30回/月 | 1ヶ月 |
| スタンダード | ¥5,980 | 100回/月 | 3ヶ月 |
| プロ | ¥9,980 | 300回/月 | 6ヶ月 |
| ビジネス | ¥19,800 | 1,000回/月 | 1年間 |

## 🔧 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# その他
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 開発ガイドライン

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コード整形
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド設定など
```

### ブランチ戦略

- `main` - プロダクション環境
- `develop` - 開発環境
- `feature/*` - 機能開発
- `fix/*` - バグ修正

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

## 📊 パフォーマンス最適化

- 画像の自動圧縮とWebP変換
- エッジでのキャッシュ戦略
- Code Splitting による初期読み込み高速化
- Progressive Web App (PWA) 対応

## 🔒 セキュリティ

- APIキーはサーバーサイドでのみ使用
- Supabase Row Level Security (RLS) 実装
- HTTPS強制
- CSRFトークン保護

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

[MIT](LICENSE)

## 📞 サポート

- 📧 Email: support@paintly.app
- 💬 Discord: [Paintly Community](https://discord.gg/paintly)
- 📖 Docs: [docs.paintly.app](https://docs.paintly.app)

## 🙏 謝辞

このプロジェクトは以下の素晴らしいオープンソースプロジェクトを使用しています：

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ by Paintly Team# Force redeploy
