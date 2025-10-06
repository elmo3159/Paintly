# Paintly - AI塗装シミュレーションアプリ

## プロジェクト概要
**Paintly（ペイントリー）** は塗装会社の営業担当者向けのAI画像生成ツールです。

### 目的
- 塗装会社の営業現場で建物の写真を撮影
- AIモデル（Gemini 2.5 Flash、Fal AI Seedream 4.0）で瞬時に塗装後の仕上がり画像を生成
- 営業成約率向上を目指す

### 主要使用デバイス
- スマートフォン（営業現場での使用を想定）
- レスポンシブデザインでデスクトップにも対応

### 技術スタック
- **フロントエンド**: Next.js 15.5.3 (App Router), React 19
- **スタイリング**: Tailwind CSS + shadcn/ui
- **言語**: TypeScript (strict mode)
- **認証・DB**: Supabase (PostgreSQL, Auth, Storage)
- **AI統合**: Google Gemini 2.5 Flash, Fal AI Seedream 4.0
- **決済**: Stripe
- **ホスティング**: Vercel
- **画像最適化**: Next.js Image Optimization

### 主要機能
1. ユーザー認証（Google OAuth対応）
2. 顧客ページ管理
3. 画像アップロード
4. カラー選択（日塗工番号対応）
5. AI画像生成（2つのプロバイダー対応）
6. ビフォーアフター比較スライダー
7. 生成履歴管理
8. 料金プラン（無料・有料プラン）