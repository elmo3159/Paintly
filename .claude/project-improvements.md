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

## 今後の改善予定
- [ ] PWA対応によるオフライン機能強化
- [ ] 画像生成プロンプトの最適化
- [ ] ユーザーインターフェースの改善
- [ ] パフォーマンスモニタリングの実装