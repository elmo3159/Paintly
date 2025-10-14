# Paintly プロジェクト改善履歴

## 改善履歴記録フォーマット
```markdown
## [日付] 改善タイトル
### 問題
- 問題の詳細説明

### 試行した解決策
1. 試行1: 内容と結果
2. 試行2: 内容と結果

### 最終的な解決策
- 採用した解決方法

### 学んだこと
- 得られた知見
```

---

## [2025-01-10] MCP（Model Context Protocol）統合
### 問題
- 開発環境でのコンテキスト管理が不十分
- セッション間での作業継続性が低い

### 試行した解決策
1. 試行1: Docker経由でのGithub MCP接続 → Dockerが未インストールで失敗
2. 試行2: Cipher MCPの初期接続 → APIキー未設定で失敗

### 最終的な解決策
- 以下のMCPサーバーを統合：
  - Supabase MCP（データベース連携）
  - Playwright MCP（ブラウザ自動化）
  - filesystem MCP（ファイルシステムアクセス）
  - Desktop Commander（デスクトップ操作）
  - Context7 MCP（コンテキスト管理）
  - Serena MCP（セマンティックコード検索）
  - Github MCP（npmパッケージ版使用）

### 学んだこと
- MCPサーバーは環境に応じて適切な接続方法を選択する必要がある
- APIキーは環境変数で管理し、.gitignoreで保護する
- Dockerが使えない環境では代替手段（npm版など）を検討する

---

## [2025-01-10] 知見管理システムの導入
### 問題
- プロジェクトの知識が散在していた
- 新しい開発セッションで過去の決定事項が失われる

### 試行した解決策
1. 試行1: CLAUDE.mdのみでの管理 → 情報が多すぎて管理困難

### 最終的な解決策
- .claudeディレクトリに知見管理システムを構築
- 5つの専用ドキュメントファイルで知識を体系化
  - context.md: プロジェクトコンテキスト
  - project-knowledge.md: 技術的知見
  - project-improvements.md: 改善履歴
  - common-patterns.md: 共通パターン
  - debug-log.md: デバッグ記録

### 学んだこと
- 知識の体系的な整理により開発効率が向上
- ファイル分割により情報の検索性が改善
- 改善履歴の記録により同じ問題の再発を防止

---

## [2025-10-14] QRコード共有機能の実装とデバッグ

### 問題
- 共有画像のダウンロードで認証エラーが発生
- Vercelデプロイメントが失敗
- ブラウザでのみAPIリクエストが失敗（curlでは成功）

### 試行した解決策

1. **試行1: Supabase Storage RLSポリシーの修正** → 効果なし
   - public読み取りポリシーを設定したが、認証エラーは解消されず
   - RLSはデータベースのアクセス制御には有効だが、Storage URLの生成には影響しない

2. **試行2: anonキーでの署名付きURL生成** → 失敗
   - `lib/supabase/server.ts` の `createClient()` を使用
   - anonキーには署名付きURLを生成する権限がない

3. **試行3: Next.js 15のparams型エラーの修正** → 部分的成功
   - `params: { id: string }` → `params: Promise<{ id: string }>` に変更
   - ビルドエラーは解決したが、API機能の問題は残存

4. **試行4: Service Worker削除** → 完全成功
   - ブラウザのService Workerが古いコードをキャッシュしていた
   - `navigator.serviceWorker.getRegistrations()` で削除後、正常動作

### 最終的な解決策

#### 1. Next.js 15対応
```typescript
// app/api/share/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shareId } = await params
  // ...
}
```

#### 2. Service Role Key使用
```typescript
// app/api/share/[id]/route.ts
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
const { data: signedData, error: signError } = await supabase.storage
  .from(bucketName)
  .createSignedUrl(fileName, 60 * 60 * 24 * 7)
```

#### 3. 環境変数の確保
```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...

# Vercelでも同様に設定
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 学んだこと

1. **Next.js 15の破壊的変更**
   - 動的ルートの `params` が Promise型に変更された
   - 既存コードの型定義を更新する必要がある
   - `await params` で値を取得する新しいパターン

2. **Supabaseの権限モデル**
   - **anon key**: クライアント側で使用、RLSポリシーに従う
   - **service_role key**: サーバー側専用、RLSをバイパス、署名付きURL生成可能
   - 署名付きURLの生成には必ず `service_role key` が必要

3. **Service Workerのキャッシュ問題**
   - 開発中は古いコードがキャッシュされる可能性がある
   - curlでは正常だがブラウザで失敗する場合、Service Workerを疑う
   - 本番環境でのキャッシュ戦略は慎重に設計する必要がある

4. **デバッグの順序**
   - サーバー側（API）とクライアント側（ブラウザ）を分けて検証
   - curlでAPIの動作を確認してからブラウザでテスト
   - ネットワークエラーはService WorkerやCORSを確認

5. **署名付きURLのメリット**
   - 時間制限付きアクセス（今回は7日間）
   - 認証不要でセキュアに画像を共有
   - トークンが失効すれば自動的にアクセス不可

### 実装の成果
- ✅ QRコード共有機能の完全動作
- ✅ 個別画像ダウンロード機能
- ✅ 一括ダウンロード機能（500ms間隔）
- ✅ 署名付きURLによるセキュアな共有（7日間有効）
- ✅ アクセスカウント機能
- ✅ 有効期限チェック機能

---

## [2025-10-14] 共有ページのスクロール問題とモバイルUX改善

### 問題
- QRコード共有ページでスクロールができない
- ユーザーが全画像を閲覧できない
- スマホでダウンロードボタンが失敗する
- 代替方法（画像長押し保存）の説明がない

### 試行した解決策

1. **試行1: 原因調査（Playwright自動テスト）** → 成功
   - 本番環境で`overflow: hidden`がhtml/bodyに設定されていることを確認
   - ルートレイアウト（`app/layout.tsx`）が全ページに`overflow-hidden`を適用
   - 共有ページでもこの設定が継承されていた

2. **試行2: 共有ページ専用レイアウト作成（styled-jsx構文）** → 失敗
   - `app/share/layout.tsx`に`<style jsx global>`を使用
   - Next.jsでstyled-jsxが有効になっていない可能性
   - デプロイ後もスタイルが適用されず

3. **試行3: dangerouslySetInnerHTML構文に変更** → 完全成功
   - `<style jsx global>`を`<style dangerouslySetInnerHTML>`に変更
   - `overflow: auto !important`で親レイアウトの設定を上書き
   - デプロイ後、正常にスクロール可能に

### 最終的な解決策

#### 1. 共有ページ専用レイアウトの作成

```typescript
// app/share/layout.tsx
export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* 共有ページはスクロール可能にする */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            overflow: auto !important;
            height: auto !important;
          }
        `
      }} />
      {children}
    </>
  )
}
```

**ポイント**:
- `!important`でルートレイアウトの`overflow: hidden`を上書き
- `dangerouslySetInnerHTML`でグローバルスタイルを確実に適用
- 共有ページ配下のみに影響（`app/share/**`）

#### 2. スマホ向けダウンロードガイダンス追加

```tsx
// app/share/[id]/page.tsx
<div className="text-center text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
  <p className="font-medium text-blue-700 dark:text-blue-300">
    📱 スマホの場合は画像を長押しして保存してください
  </p>
  <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
    ダウンロードボタンが動作しない場合の代替方法です
  </p>
</div>
```

**配置位置**: 「すべての画像をダウンロード」ボタンの直下

### 学んだこと

1. **Next.js App Routerのレイアウト継承**
   - 子ルートは親レイアウトのスタイルを継承する
   - 特定ルートのみスタイルを変更したい場合は、専用レイアウトを作成
   - `!important`で親の設定を確実に上書き可能

2. **Next.jsでのグローバルスタイル適用**
   - `<style jsx global>`はstyled-jsxパッケージが必要
   - `dangerouslySetInnerHTML`は標準機能で確実に動作
   - グローバルスタイルには`dangerouslySetInnerHTML`が推奨

3. **モバイルブラウザのダウンロード制限**
   - iOSのSafariではJavaScriptによるダウンロードが制限される場合がある
   - CORS制約により外部URLからのダウンロードが失敗することがある
   - 画像長押し保存は全モバイルブラウザで動作する確実な方法

4. **Playwright自動テストの活用**
   - 本番環境の問題を再現して原因を特定
   - `window.getComputedStyle()`でスタイルの継承を確認
   - `window.scrollTo()`で実際のスクロール可否をテスト

5. **UXの重要性**
   - ダウンロードボタンが失敗する場合の代替方法を明示
   - スマホユーザーに優しいガイダンスを提供
   - エラー時の対処法を事前に説明することで満足度向上

### 実装の成果
- ✅ 共有ページのスクロール機能が正常動作（155pxのスクロール範囲）
- ✅ スマホ向け「画像長押し保存」ガイダンスの表示
- ✅ ダウンロード失敗時の代替方法を明示
- ✅ ページタイトル「共有画像 - Paintly」に変更（SEO最適化）
- ✅ 共有ページのみ検索エンジンインデックスを無効化（`robots: { index: false }`）

### デプロイメント
- コミット: `3a36bf5` (初回), `aa3334e` (スタイル構文修正)
- 本番URL: https://paintly-chi.vercel.app/share/[id]
- デプロイ状態: ✅ 完全成功

---

## [2025-10-14] 共有ページUI簡素化（一括ダウンロードボタン削除）

### 問題
- 「すべての画像をダウンロード」ボタンがモバイルで動作しない
- ガイダンステキストが冗長（2行表示）
- 個別DLボタンで十分なのに一括DLボタンが不要

### ユーザーフィードバック
ユーザーからの直接的なフィードバック:
- 一括ダウンロードボタンは削除してほしい
- 個別のDLボタンで十分
- 「ダウンロードボタンが動作しない場合の代替方法です」の説明文も不要

### 試行した解決策

1. **試行1: 初回修正でガイダンス追加** → 過剰
   - スクロール問題修正と同時にガイダンス追加
   - 2行のガイダンス（メイン+説明）が冗長だった

2. **試行2: ユーザーフィードバックを受けて簡素化** → 成功
   - 一括ダウンロードボタンを完全削除
   - ガイダンスを1行に簡素化
   - 不要なコードを削除（`downloadAllImages`関数、`downloading`状態）

### 最終的な解決策

#### 1. 一括ダウンロードボタンの削除
```typescript
// 削除したコード:
const [downloading, setDownloading] = useState(false) // 状態変数

const downloadAllImages = async () => {
  // 一括ダウンロード処理（20行のコード）
}

<Button onClick={downloadAllImages}>
  すべての画像をダウンロード (2枚)
</Button>
```

#### 2. ガイダンスの簡素化
```typescript
// BEFORE (2行):
<p>📱 スマホの場合は画像を長押しして保存してください</p>
<p>ダウンロードボタンが動作しない場合の代替方法です</p>

// AFTER (1行):
<p>📱 スマホの場合は画像を長押しして保存してください</p>
```

#### 3. 個別DLボタンは維持
```typescript
// 各画像カードに個別のDLボタンを維持
<Button
  size="sm"
  variant="outline"
  onClick={() => downloadImage(url, index)}
>
  <Download className="h-4 w-4 mr-1" />
  DL
</Button>
```

### 学んだこと

1. **ユーザーフィードバックの重要性**
   - 開発者視点で「便利」と思った機能がユーザーには不要な場合がある
   - 実際の使用シーンでは個別DLで十分だった
   - シンプルなUIの方が使いやすい

2. **モバイルファースト設計の実践**
   - モバイルでJavaScriptダウンロードが制限されることを前提にUI設計
   - 画像長押し保存という標準的な操作を推奨する方が親切
   - 技術的な回避策よりもプラットフォーム標準の操作を優先

3. **コード管理のベストプラクティス**
   - 不要になった機能はすぐに削除（技術的負債にならない）
   - 関連するコード（状態変数・関数・UIコンポーネント）をすべて削除
   - コミットメッセージでリファクタリング意図を明確化

4. **UI/UXの原則**
   - 説明が必要な機能は設計を見直すべき
   - 1つのボタンで十分な場合、複数のオプションは混乱を招く
   - ガイダンスは簡潔に（1行で伝える）

### 実装の成果
- ✅ コードの簡素化（50行以上削除）
- ✅ UIのクリーンアップ（不要なボタン削除）
- ✅ ガイダンスの明確化（1行のみ）
- ✅ メンテナンス性の向上（不要なコード削除）
- ✅ モバイルUXの改善（標準操作の推奨）

### デプロイメント
- コミット: `6e20b12` (一括ダウンロード機能削除)
- 本番URL: https://paintly-chi.vercel.app/share/[id]
- デプロイ状態: ✅ 完全成功
- 検証方法: Playwright自動テストで動作確認

---

## 今後の改善予定
- [ ] PWA対応によるオフライン機能強化
- [ ] 画像生成プロンプトの最適化
- [ ] ユーザーインターフェースの改善
- [ ] パフォーマンスモニタリングの実装