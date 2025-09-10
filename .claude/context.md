# Paintly プロジェクトコンテキスト

## プロジェクト名
**Paintly（ペイントリー）** - Paint + Instantly の造語

## プロジェクトの目的
塗装会社の営業担当者が顧客宅を訪問した際に、その場で建物の写真を撮影し、AIモデル「gemini-2.5-flash-image-preview」を使用して瞬時に塗装後の仕上がり画像を生成・提示することで、営業成約率を向上させるツール。

## 主要ターゲット
- **利用者**: 塗装会社の営業担当者
- **使用デバイス**: スマートフォン（営業現場での使用）
- **利用シーン**: 顧客宅訪問時のその場での提案

## 技術スタック
### フロントエンド
- Next.js 14/15 (App Router)
- Tailwind CSS + shadcn/ui
- Zustand（状態管理）

### バックエンド
- Next.js API Routes
- Google AI Studio API (gemini-2.5-flash-image-preview)
- Supabase (PostgreSQL)

### インフラ
- Vercel（ホスティング）
- Cloudflare R2（画像ストレージ）
- Cloudflare Workers（エッジ処理）

## 重要な制約・要件
1. **モバイルファースト設計**: スマートフォンでの使用を最優先
2. **高速レスポンス**: 営業現場での即座の利用
3. **オフライン対応**: ネットワーク不安定な環境での使用
4. **Progressive Enhancement**: 段階的な機能強化

## API情報
- **Gemini API Key**: AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w
- **Supabase Project ID**: mockfjcakfzbzccabcgm
- **Supabase URL**: https://mockfjcakfzbzccabcgm.supabase.co

## 決済・認証
- **決済**: Stripe（サブスクリプション管理）
- **認証**: Supabase Auth
- **支払い方法**: クレジット・デビット・PayPay・コンビニ払い・銀行振込

## 料金プラン
- **無料プラン**: 3回まで（新規登録後）
- **ライトプラン**: 月額2,980円（30回/月）
- **スタンダードプラン**: 月額5,980円（100回/月）
- **プロプラン**: 月額9,980円（300回/月）
- **ビジネスプラン**: 月額19,800円（1,000回/月）