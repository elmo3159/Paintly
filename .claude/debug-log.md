# Paintly デバッグログ

## デバッグ記録フォーマット
```markdown
## [日付時刻] エラー/問題のタイトル
### 症状
- 発生した問題の詳細

### エラーメッセージ
```
エラーメッセージをここに記載
```

### 原因
- 特定した原因

### 解決方法
- 実施した解決方法

### 関連ファイル
- ファイルパス1
- ファイルパス2
```

---

## 重要なデバッグTips

### Gemini API関連
1. **APIキーの確認**
   - 環境変数名: `GEMINI_API_KEY`
   - API Routeでのみ使用（クライアントサイドで使用しない）

2. **画像サイズ制限**
   - 最大4MBまで
   - Base64エンコード前にリサイズ推奨

3. **レート制限**
   - 無料プランでは分あたり60リクエストまで
   - エラー時は429ステータスコードを返す

### Supabase関連
1. **RLS（Row Level Security）エラー**
   - テーブルにRLSが有効な場合、適切なポリシー設定が必要
   - 開発時は一時的にRLSを無効化することも検討

2. **認証エラー**
   - anonキーとservice_roleキーの使い分けに注意
   - クライアント側ではanonキーのみ使用

3. **型エラー**
   - `npx supabase gen types`で型を再生成
   - Database.tsファイルの更新を確認

### Next.js関連
1. **ハイドレーションエラー**
   - サーバーとクライアントのレンダリング結果が異なる場合に発生
   - `use client`ディレクティブの適切な使用

2. **動的インポートエラー**
   - SSR非対応のライブラリは動的インポートを使用
   ```typescript
   const Component = dynamic(() => import('library'), { ssr: false })
   ```

3. **環境変数アクセスエラー**
   - クライアント側: `NEXT_PUBLIC_`プレフィックスが必要
   - サーバー側: プレフィックス不要

### よくあるエラーと対処法

#### CORS エラー
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**解決方法**: API Routeを経由してリクエストを送信

#### メモリリークエラー
```
Warning: Can't perform a React state update on an unmounted component
```
**解決方法**: useEffectのクリーンアップ関数を実装

#### TypeScriptエラー
```
Type 'undefined' is not assignable to type 'string'
```
**解決方法**: Optional chaining（?.）やNullish coalescing（??）を使用

---

## 現在追跡中の問題
（現在追跡中の問題はありません）

---

## 解決済みの重要な問題

### [2025-10-14] QRコード共有機能のダウンロードエラー

### 症状
- ブラウザでシェアページにアクセスすると「予期しないエラーが発生しました」と表示
- APIエンドポイント (`/api/share/[id]`) が `net::ERR_FAILED` で失敗
- curlコマンドでは正常にレスポンスを返す（ブラウザのみ失敗）

### エラーメッセージ
```
[ERROR] Failed to load resource: net::ERR_FAILED @ https://paintly-chi.vercel.app/api/share/9f6c4340...
TypeError: Failed to fetch
```

### 原因
1. **Next.js 15での型変更**: `params` が Promise型に変更され、ビルドエラーが発生
2. **Supabase署名付きURL生成失敗**: `anon key` では署名付きURLを生成できない（`service_role key` が必要）
3. **Service Workerのキャッシュ**: 古いコードやリクエストハンドラーがキャッシュされ、新しいAPIエンドポイントへのリクエストをブロック

### 解決方法

#### 1. Next.js 15対応 (app/api/share/[id]/route.ts)
```typescript
// Before
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shareId = params.id

// After
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shareId } = await params
```

#### 2. 署名付きURL生成用にService Role Key使用
```typescript
// Before: anonキーを使用（権限不足）
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// After: service_role keyを使用
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

#### 3. Service Worker削除
```javascript
// ブラウザコンソールで実行
const registrations = await navigator.serviceWorker.getRegistrations();
for (const reg of registrations) {
  await reg.unregister();
}
```

### テスト結果
- ✅ 個別画像ダウンロードボタン: 正常動作
- ✅ 一括ダウンロードボタン: 正常動作（2枚を500ms間隔で順次ダウンロード）
- ✅ 署名付きURL: 7日間有効なトークン付きURLが生成される
- ✅ 閲覧カウント: アクセスごとに正常にカウントアップ

### 関連ファイル
- app/api/share/[id]/route.ts
- app/share/[id]/page.tsx
- .env.local (SUPABASE_SERVICE_ROLE_KEY)

### 学んだこと
1. Next.js 15では動的ルートの `params` は Promise型になった
2. Supabase署名付きURLの生成には `service_role key` が必須
3. Service Workerは便利だが、開発中は古いキャッシュが問題を引き起こす可能性がある
4. curlで正常でもブラウザで失敗する場合、Service Workerやキャッシュを疑う

---

### [2025-01-10] Cipher MCP接続エラー
### 症状
- Cipher MCPサーバーが起動しない
- "No API key found"エラー

### エラーメッセージ
```
[CIPHER-MCP] ERROR: No API key or Ollama configuration found
```

### 原因
- Cipher MCPにはOpenAI、Anthropic等のAPIキーが必要
- 環境変数が正しく設定されていなかった

### 解決方法
- OpenAI APIキーを環境変数として設定
- .envファイルに`OPENAI_API_KEY`を追加
- MCPサーバー設定でenvパラメータにAPIキーを追加

### 関連ファイル
- /.env
- ~/.claude.json