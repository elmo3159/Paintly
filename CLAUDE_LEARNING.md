# 🎓 Paintly 重要な学習事項・開発上の注意点

このドキュメントは、Paintly開発で遭遇した重要な学習事項と注意点をまとめたものです。

---

## Next.js 15 破壊的変更（2025年10月時点）

### 動的ルートのparamsがPromise型に変更

Next.js 15では、動的ルートの `params` が Promise型に変更されました。既存コードを更新する必要があります。

**旧実装（Next.js 14以前）:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shareId = params.id
  // ...
}
```

**新実装（Next.js 15）:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shareId } = await params  // awaitが必須
  // ...
}
```

**影響範囲:**
- `app/api/[dynamic]/route.ts` - API Routes
- `app/[dynamic]/page.tsx` - Page Routes
- すべての動的セグメントを使用するルート

**ビルドエラー例:**
```
Type error: Type '{ __tag__: "GET"; __param_position__: "second"; __param_type__: { params: { id: string; }; }; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.
  The types of '__param_type__.params' are incompatible between these types.
    Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
```

---

## Supabase権限モデルとStorageアクセス

### anonキー vs service_roleキーの使い分け

#### anonキー（クライアント側用）
- ✅ クライアント側で使用可能
- ✅ RLS（Row Level Security）ポリシーに従う
- ❌ 署名付きURLは生成できない
- ❌ RLSをバイパスできない

#### service_roleキー（サーバー側専用）
- ❌ クライアント側では絶対に使用しない（セキュリティリスク）
- ✅ サーバー側API Routesでのみ使用
- ✅ 署名付きURLを生成可能
- ✅ RLSをバイパスできる
- ✅ 管理者権限での操作が可能

### 署名付きURL生成の正しい実装

**❌ 間違い: anonキーでは署名付きURLを生成できない**
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // これはanonキーを使用
```

**✅ 正解: service_roleキーで署名付きURLを生成**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 署名付きURL生成（7日間有効）
const { data, error } = await supabase.storage
  .from('bucket-name')
  .createSignedUrl('file-path', 60 * 60 * 24 * 7)
```

### 署名付きURLのメリット
- 時間制限付きアクセス（セキュリティ向上）
- 認証不要で画像を共有可能
- トークンが失効すれば自動的にアクセス不可
- プライベートバケットの画像を安全に共有

---

## Service Workerのキャッシュ問題

### 開発中の注意事項

**症状:**
- curlやPostmanでAPIが正常に動作するのに、ブラウザでは失敗
- `net::ERR_FAILED` エラーが発生
- 古いコードがキャッシュされて新しいコードが反映されない

**原因:**
Service Workerが古いコードやリクエストハンドラーをキャッシュしている

**解決方法:**
```javascript
// ブラウザコンソールで実行
const registrations = await navigator.serviceWorker.getRegistrations();
for (const reg of registrations) {
  await reg.unregister();
}

// ページをリロード
location.reload();
```

### 開発時のベストプラクティス
1. Chrome DevToolsで「Disable cache」をオンにする
2. Application タブで Service Worker を確認・削除
3. 本番環境では慎重なキャッシュ戦略を設計
4. Service Workerのバージョニング機能を活用

---

## デバッグの効率的な順序

### APIエラーのデバッグ手順

#### 1. サーバー側の検証（curlやPostmanを使用）
```bash
curl -s "https://your-app.vercel.app/api/endpoint"
```
→ これで正常に動作すれば、サーバー側は問題なし

#### 2. クライアント側の検証（ブラウザ）
- Network タブでリクエストを確認
- Console タブでエラーを確認
- Application タブで Service Worker を確認

#### 3. 問題の切り分け
- **サーバー側で失敗** → APIコードの問題
- **サーバー側で成功、ブラウザで失敗** → Service Worker/CORS/キャッシュの問題

### よくあるエラーパターン

**curlで成功、ブラウザで失敗:**
- Service Workerのキャッシュ
- CORSの設定ミス
- ブラウザのキャッシュ
- Cookie/認証の問題

**ブラウザでもcurlでも失敗:**
- APIコードのバグ
- 環境変数の設定ミス
- データベース接続エラー
- 外部API（Supabase等）の問題

---

## Vercelデプロイメントのトラブルシューティング

### ビルドエラーの確認方法

```bash
# ローカルでビルドを実行（Vercelと同じ環境で確認）
npm run build

# Vercelのデプロイメント一覧を確認
npx vercel ls your-project --token YOUR_TOKEN

# 環境変数の確認
npx vercel env ls --token YOUR_TOKEN
```

### 環境変数の設定
```bash
# Vercelに環境変数を追加
npx vercel env add VARIABLE_NAME --token YOUR_TOKEN

# 本番環境、プレビュー環境、開発環境すべてに設定
# Production, Preview, Development を選択
```

### 重要な環境変数
- **`SUPABASE_SERVICE_ROLE_KEY`**: サーバー側でのみ使用、絶対にクライアント側に露出させない
- **`NEXT_PUBLIC_*`**: クライアント側で使用可能な環境変数（公開されるので機密情報は含めない）

---

## QRコード共有機能の実装ポイント

### 署名付きURL生成フロー
```
1. ユーザーが共有リンクにアクセス
   ↓
2. /api/share/[id] が呼ばれる
   ↓
3. service_role keyでSupabaseクライアント作成
   ↓
4. shared_imagesテーブルから画像情報を取得
   ↓
5. 各画像URLから署名付きURLを生成（7日間有効）
   ↓
6. 署名付きURLをクライアントに返す
   ↓
7. クライアントで画像を表示・ダウンロード
```

### エラーハンドリング
- 有効期限切れチェック（410 Gone）
- 共有リンクが存在しないチェック（404 Not Found）
- アクセスカウントの更新（楽観的更新）
- 署名付きURL生成失敗時のフォールバック（元のURLを使用）

---

## 今後の開発で注意すべきこと

### 1. Next.js 15の型変更は他のルートにも適用必要
- すべての動的ルートで `params` を `await` する必要がある
- API Routes、Page Routes両方で対応が必要

### 2. Supabaseのキー管理を徹底
- service_roleキーは絶対にクライアント側に露出させない
- 環境変数は `.env.local` と Vercel の両方に設定
- GitHub等に環境変数をコミットしない（.gitignoreで保護）

### 3. Service Workerのキャッシュ戦略を慎重に設計
- 開発中は無効化も検討
- 本番環境ではバージョニング機能を活用
- キャッシュのライフタイムを適切に設定

### 4. 署名付きURLの有効期限を適切に設定
- 現在は7日間だが、用途に応じて調整可能
- 短すぎるとユーザー体験が悪化、長すぎるとセキュリティリスク
- 共有機能の用途に合わせて設計

---

## 参考資料

- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/signed-urls)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**最終更新日**: 2025年10月14日
