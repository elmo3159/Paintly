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

## QRコード共有URL生成の問題

### 問題の詳細
QRコード共有機能で生成されるURLが、プレビュー環境のドメイン（`paintly-elmos-projects-cf77d205.vercel.app`）になってしまい、本番環境のドメイン（`paintly-chi.vercel.app`）にならない問題が発生。

### 原因
`app/api/share/create/route.ts` の111行目で、環境変数 `NEXT_PUBLIC_APP_URL` が未設定の場合、`request.nextUrl.origin` をフォールバックとして使用していた：

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
```

`.env.local` では `NEXT_PUBLIC_APP_URL=http://localhost:3005` とローカル開発用の値が設定されており、本番環境URLが設定されていなかった。

### 解決策
1. **.env.local の更新**:
   ```
   NEXT_PUBLIC_APP_URL=https://paintly-chi.vercel.app
   ```

2. **Vercel環境変数の更新** (Vercel API経由):
   ```bash
   curl -X PATCH "https://api.vercel.com/v10/projects/{projectId}/env/{envId}" \
     -H "Authorization: Bearer {token}" \
     -d '{"value":"https://paintly-chi.vercel.app","target":["production","preview","development"]}'
   ```

3. **再デプロイ**: 環境変数の変更を反映させるため、コードの小さな変更をプッシュして再デプロイをトリガー

### 学んだこと
- `NEXT_PUBLIC_*` 環境変数はビルド時に埋め込まれるため、変更後は再デプロイが必須
- `request.nextUrl.origin` は動的な値であり、プレビュー環境やブランチデプロイメントでは異なるドメインを返す
- 本番環境URLは必ず明示的に環境変数で設定すべき
- Vercel環境変数の更新には Vercel API (`PATCH /v10/projects/{projectId}/env/{envId}`) を使用可能

### 関連ファイル
- `app/api/share/create/route.ts` (line 111-112)
- `.env.local`
- Vercel環境変数設定

---

## QRコード共有機能の検証とService Workerキャッシュ問題（2回目）

### 問題の再発見（2025年10月14日）

環境変数を修正して再デプロイ後、QRコード生成をテストしたところ、以下の症状が再発：

**症状:**
- 新しく生成されたQRコード共有URLは正しい本番ドメイン（`paintly-chi.vercel.app`）を使用
- しかし、そのURLにブラウザでアクセスすると「予期しないエラーが発生しました」が表示
- curlで同じAPIエンドポイントをテストすると正常にレスポンスが返る
- ブラウザのNetwork タブで `net::ERR_FAILED` エラーが発生

### 根本原因の特定

**Service Workerが古いコードを再度キャッシュしていた**

デプロイ後、ブラウザがページをロードすると新しいService Workerが登録される。しかし：
1. 古いService Workerがまだアクティブな場合がある
2. 新しいSWが登録されても、古いSWのキャッシュが残っている
3. PWA機能により、APIリクエストが古いキャッシュを参照してしまう

### 検証プロセス

**1. curlでのAPI検証（成功）**
```bash
curl -s "https://paintly-chi.vercel.app/api/share/5fe2f54d-3090-4e16-ad2c-48e265c00899"
# → 正常にJSON レスポンスが返る（署名付きURL含む）
```

**2. ブラウザでのアクセス（失敗）**
- エラーメッセージ: 「予期しないエラーが発生しました」
- Console エラー: `net::ERR_FAILED`

**3. Service Worker削除（解決）**
```javascript
const registrations = await navigator.serviceWorker.getRegistrations();
for (const reg of registrations) {
  await reg.unregister();
}
location.reload();
```

**4. 再アクセス（成功）**
- 共有ページが正常に表示
- 画像2枚が表示され、ダウンロード機能も正常動作
- アクセスカウントが正常に記録

### 重要な学習ポイント

#### 1. Service Workerの二段階問題

**第一段階**: 開発中のキャッシュ
- ローカル開発中に古いコードがキャッシュされる
- → 開発時は「Disable cache」を有効にする

**第二段階**: デプロイ後のキャッシュ（今回遭遇）
- 新しいコードをデプロイしても、ユーザーのブラウザに古いSWが残る
- → バージョニング戦略が必要

#### 2. デバッグの効率的な順序（再確認）

**必ずこの順序で検証する:**
```
1. curl/Postmanでサーバー側を検証
   ↓
2. サーバーが正常 → ブラウザでテスト
   ↓
3. ブラウザで失敗 → Service Worker/キャッシュを疑う
   ↓
4. Service Worker削除 → 再テスト
```

**curlで成功してブラウザで失敗 = ほぼ100% キャッシュ問題**

#### 3. Next.js PWAとService Workerの管理

**現在の問題点:**
- `public/sw.js` でService Workerを登録している
- バージョニング機能がない
- キャッシュ戦略が明示的でない

**改善すべき点:**
```javascript
// sw.js にバージョン番号を追加
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `paintly-cache-${CACHE_VERSION}`;

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

#### 4. 環境変数の設定ベストプラクティス（再確認）

**`NEXT_PUBLIC_*` 環境変数の特性を理解する:**

- ✅ ビルド時に埋め込まれる（静的）
- ✅ クライアント側で読み取り可能
- ❌ ビルド後は変更不可（再デプロイが必須）
- ❌ 動的な値に依存してはいけない

**良い例:**
```typescript
// 明示的に本番URLを設定
const baseUrl = process.env.NEXT_PUBLIC_APP_URL; // 'https://paintly-chi.vercel.app'
if (!baseUrl) throw new Error('NEXT_PUBLIC_APP_URL is required');
```

**悪い例:**
```typescript
// 動的な値にフォールバック（環境によって異なる値になる）
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
```

#### 5. Vercel環境変数の更新方法

**Vercel API経由での更新（推奨）:**
```bash
# 1. 環境変数IDを取得
curl "https://api.vercel.com/v9/projects/{projectId}/env" \
  -H "Authorization: Bearer {token}" | jq

# 2. 環境変数を更新
curl -X PATCH "https://api.vercel.com/v10/projects/{projectId}/env/{envId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"value":"https://paintly-chi.vercel.app","target":["production","preview","development"]}'

# 3. 再デプロイ（環境変数変更を反映）
git commit --allow-empty -m "chore: trigger redeploy for env var update"
git push
```

**Vercel Dashboard経由での更新:**
1. Project Settings → Environment Variables
2. 変更したい変数の「Edit」をクリック
3. 値を更新して保存
4. 「Redeploy」ボタンをクリック

### 検証成功の記録

**生成されたQRコード共有URL:**
`https://paintly-chi.vercel.app/share/5fe2f54d-3090-4e16-ad2c-48e265c00899`

**検証結果（すべて✅）:**
- ✅ 正しい本番ドメインを使用
- ✅ 共有ページが正常に表示
- ✅ タイトル: 「塗装シミュレーション画像」
- ✅ 作成日: 2025/10/14
- ✅ 閲覧数: 3回（アクセスカウント機能が正常動作）
- ✅ 有効期限: 2025/10/21まで有効
- ✅ 画像2枚が正常に表示
- ✅ 個別ダウンロードボタンが機能
- ✅ 一括ダウンロードボタンが機能

### 今後の対策

**短期的対策（開発中）:**
1. Chrome DevToolsで「Disable cache」を常時オン
2. Application タブでService Workerを定期的に確認・削除
3. デプロイ後は必ずService Workerをクリアしてテスト

**長期的対策（本番環境）:**
1. Service Workerにバージョニング機能を実装
2. キャッシュ戦略を明示的に定義
3. 古いキャッシュを自動削除する仕組みを追加
4. PWA更新時のユーザー通知機能を実装

**環境変数管理:**
1. `.env.local` と Vercel環境変数を必ず同期
2. `NEXT_PUBLIC_*` 変数は絶対に動的値にフォールバックしない
3. 環境変数変更後は必ず再デプロイ
4. Vercel APIを使った自動化スクリプトを検討

---

## 参考資料

- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/signed-urls)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel API - Environment Variables](https://vercel.com/docs/rest-api/endpoints/environment-variables)

---

**最終更新日**: 2025年10月14日
