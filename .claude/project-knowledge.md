# Paintly プロジェクト技術知見

## アーキテクチャ決定事項

### 1. Next.js App Router採用理由
- Server Componentsによるパフォーマンス最適化
- エッジランタイムでの実行が可能
- 画像処理APIとの親和性が高い
- RSC（React Server Components）による初期読み込みの高速化

### 2. Supabase選定理由
- リアルタイムデータベース機能
- 認証機能が組み込み済み
- 無料枠が充実
- TypeScript型生成が可能
- Row Level Security（RLS）でセキュアなデータアクセス

### 3. Cloudflare R2選定理由
- S3互換API
- エグレス料金無料
- 画像配信の高速化
- CDN統合が容易

## 実装パターン

### API設計
```typescript
// API Routeの基本パターン
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 処理
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Supabase接続パターン
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Gemini API統合パターン
```typescript
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GEMINI_API_KEY
  },
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: base64Image }}
      ]
    }]
  })
})
```

## 避けるべきパターン

### 1. クライアントサイドでのAPIキー使用
- 必ずサーバーサイド（API Routes）で処理
- 環境変数はNEXT_PUBLIC_プレフィックスを付けない

### 2. 同期的な画像処理
- 必ず非同期処理を使用
- ローディング状態の適切な管理
- タイムアウト処理の実装

### 3. 大きな画像の直接アップロード
- クライアントサイドでリサイズ処理
- 適切な圧縮処理の実装
- プログレッシブエンハンスメント

## ライブラリ選定

### UI/UX関連
- **shadcn/ui**: カスタマイズ性が高く、軽量
- **react-dropzone**: ドラッグ&ドロップ対応
- **react-compare-slider**: ビフォーアフター比較
- **react-zoom-pan-pinch**: ズーム機能

### 状態管理
- **Zustand**: Reduxよりシンプルで軽量
- TypeScript対応が優秀
- DevToolsサポート

### 画像処理
- **sharp**: Node.js環境での画像処理（サーバーサイド）
- **browser-image-compression**: クライアントサイド圧縮

## パフォーマンス最適化

### 1. 画像最適化
- WebP/AVIF自動変換
- Next.js Image Componentの活用
- Lazy loading実装
- プレースホルダー画像の使用

### 2. キャッシュ戦略
- Cloudflare CDNでの静的アセットキャッシュ
- API Responseキャッシュ（適切なCache-Control）
- Supabaseクエリキャッシュ

### 3. バンドルサイズ最適化
- Dynamic Import活用
- Tree Shaking
- Code Splitting