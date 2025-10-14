# Paintly - 塗装会社向けカラーチェンジツール開発仕様書

## プロジェクト概要

### アプリケーション名
**Paintly（ペイントリー）**
- Paint + Instantly の造語（「塗装を瞬時に」）
- Grammarly、Calendlyのような成功したSaaS命名法を採用
- グローバル展開可能な発音しやすく覚えやすい名称

### 目的
塗装会社の営業担当者が顧客宅を訪問した際に、その場で建物の写真を撮影し、AIモデル「gemini-2.5-flash-image-preview」を使用して瞬時に塗装後の仕上がり画像を生成・提示することで、営業成約率を向上させるツール。

### 主要使用デバイス
スマートフォン（営業現場での使用を想定）

## 機能要件

### 1. ユーザー認証・料金体系
- **無料会員登録制**
- **無料プラン**: 新規登録後3回まで画像生成可能
- **3回以降**: 有料プランへのアップグレードが必要
- **決済方法**: Stripe経由でクレジット・デビット・PayPay・コンビニ払い・銀行振込に対応

### 2. UI構成

#### サイドバー（左側固定）
- **「＋」ボタン**: 新規顧客ページ作成
- **顧客ページリスト**: 作成済みの顧客ページへのナビゲーション（タイトル付き）
- **プラン情報表示**（サイドバー最下部）:
  - 現在のプラン名
  - 現在の生成回数
  - 残り生成可能回数
  - 残り回数を視覚化するゲージ

#### メインコンテンツエリア（顧客ページ）

##### 画像アップロード機能
- 建物の正面写真アップロード（必須）

##### カラー選択機能

**壁の色**
- ドロップダウン形式
- デフォルト: 「変更なし」
- カラーパレット表示:
  - 丸枠内に実際の色を表示
  - 丸枠下に日塗工番号（例: N90, 07-40X）を表示

**屋根の色**
- 壁の色と同様の仕様
- デフォルト: 「変更なし」

**ドアの色**
- 壁の色と同様の仕様
- デフォルト: 「変更なし」

##### 追加オプション

**天候選択**
- ドロップダウン形式
- 選択肢: 変更なし、晴れ、曇り、雨、雪

**正面と横の写真を並べる**
- チェックボックス形式
- チェック時に以下のオプションが出現:
  - 背景色選択: 白、黒、薄ピンク
  - 横から見た建物の写真アップロード欄

**その他の指定**
- フリーテキストボックス
- 入力内容を直接プロンプトに反映

##### 実行ボタン
- 設定完了後、画像生成を実行

### 3. 画像生成機能

#### プロンプト生成ロジック
色選択に応じて自動的にプロンプトを構築。

**例: 日塗工番号07-40Xを選択した場合**
```
壁の色は、・R.G.B: 185　0　25 ・16進数カラーコード: #B90019 ・マンセル値: 7.5R4/14 ・日本塗料工業会色番号: 07-40X  の色に変更してください。
```

C:\Users\elmod\Desktop\CursorApp\Paintly\カラー一覧.pdf
上記のカラー一覧というPDFに、たくさんの色の日塗工番号とRGB、カラーコード、マンセル値の記載があります。
このPDFに基づいて、色についての実装を行ってください。
間違えないようにしっかりと読み取ってください。

**正面と横の写真を並べるオプション選択時**
```
この建物だけを切り抜いて、背景を[選択した色]にして、建物を横から見た画像も１枚の画像に並べてください。
```

### 4. 履歴管理
- 生成された画像は顧客ページ内の履歴に保存
- 生成済み画像を新たな入力画像として再利用可能

### 5. ビフォーアフター比較機能

#### スライダー機能
- 元画像と生成画像を重ねて表示
- スライダーで境界線を左右に移動
  - 中央: 左半分が元画像、右半分が生成画像
  - 左端: 完全に生成画像を表示
  - 右端: 完全に元画像を表示

#### 複数画像切り替え
- 複数の生成画像がある場合、ワンタップで切り替え可能

#### ズーム機能
- 特定部分を拡大しながらスライダー操作可能

### 6. 画像ダウンロード機能
- PC: ダウンロードボタン
- スマートフォン: カメラロールへの保存対応

追加機能なしで、純粋に生成回数のみで差別化した料金プランを再設計します。

## Paintlyの改定料金プラン（シンプル版）

### 🎨 **無料プラン**
- **料金**: 無料
- **生成回数**: 3回まで（アカウント作成後）
- **顧客ページ**: 3件まで
- **画像保存期間**: 7日間
- **目的**: お試し利用

### 📱 **ライトプラン**
- **料金**: 月額2,980円
- **生成回数**: 30回/月
- **顧客ページ**: 無制限
- **画像保存期間**: 1ヶ月
- **想定**: 週1-2件の営業活動

### 🏠 **スタンダードプラン**
- **料金**: 月額5,980円
- **生成回数**: 100回/月
- **顧客ページ**: 無制限
- **画像保存期間**: 3ヶ月
- **想定**: 週3-5件の営業活動

### 🏢 **プロプラン**
- **料金**: 月額9,980円
- **生成回数**: 300回/月
- **顧客ページ**: 無制限
- **画像保存期間**: 6ヶ月
- **想定**: 毎日の営業活動

### 🏭 **ビジネスプラン**
- **料金**: 月額19,800円
- **生成回数**: 1,000回/月
- **顧客ページ**: 無制限
- **画像保存期間**: 1年間
- **想定**: 複数営業担当での利用

### 💎 **永久プラン**
- **料金**: 無料（知り合い・友人限定特別版）
- **生成回数**: 無制限
- **顧客ページ**: 無制限
- **画像保存期間**: 永久保存
- **想定**: 塗装業界のプロフェッショナル向け
- **特典**:
  - 今後の新機能を無料で利用可能
  - 優先サポート
  - API制限なし


## 技術仕様

### フロントエンド
- **フレームワーク**: Next.js 14/15 (App Router)
- **スタイリング**: Tailwind CSS + shadcn/ui
- **状態管理**: Zustand
- **画像処理ライブラリ**:
  - react-compare-slider（ビフォーアフター比較）
  - react-zoom-pan-pinch（ズーム機能）
  - react-dropzone（画像アップロード）

### バックエンド
- **API**: Next.js API Routes または Fastify
- **AI統合**: Google AI Studio API (gemini-2.5-flash-image-preview)
- **データベース**: Supabase (PostgreSQL)
- **画像ストレージ**: Cloudflare R2 または Supabase Storage

### 認証・決済
- **認証**: Supabase Auth または Clerk
- **決済**: Stripe（サブスクリプション管理）

### インフラ
- **ホスティング**: Vercel（フロントエンド）
- **エッジ処理**: Cloudflare Workers（画像処理API）

### パフォーマンス最適化
- **画像最適化**: WebP/AVIF自動変換、プログレッシブエンハンスメント、Lazy loading
- **PWA化**: オフライン対応、アプリライクな体験
- **キャッシュ戦略**: Redis/Upstashでプロンプトテンプレートキャッシュ、CDNで生成画像キャッシュ

## デザイン要件
- **テーマ**: 塗装業界らしさを表現
- **バランス**: 軽量性とリッチ感の両立
- **エフェクト**: 軽量なエフェクトは使用可
- **レスポンシブデザイン**: スマートフォン最適化を最重要視

## アーキテクチャ
```
[ユーザー] → [Next.js App] → [Edge API] → [Gemini API]
                ↓                ↓
           [Supabase]      [Cloudflare R2]
            (認証/DB)       (画像ストレージ)
```

## 開発上の重要ポイント
1. **モバイルファースト**: 営業現場でのスマホ利用を最優先に設計
2. **高速性**: エッジでの処理とCDN活用で瞬時の応答を実現
3. **オフラインファースト**: ネットワーク不安定な環境でも使用可能
4. **Progressive Enhancement**: 段階的な機能強化で安定性確保

## 補足事項
- ChatGPTのWebサイトと同様のUX/UIを参考にする
- 顧客ごとの管理機能を重視
- 営業現場での即座の利用を最重要視した設計

サイトをテストする際は、Paintly独自のアカウント↓
elmodayo3159@gmail.com
Pass:sanri3159
こちらのアカウントを使ってください。

AI生成のテストを行う場合は、
C:\Users\elmod\Desktop\CursorApp\Paintly\Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png
こちらの画像を使ってテストしてください。

## 知見管理システム

プロジェクトの知識を体系的に管理するため、`.claude`ディレクトリに知見管理システムを導入しています。

### ディレクトリ構造
```
.claude/
├── context.md               # プロジェクトの背景と制約
├── project-knowledge.md     # 技術的な知見とパターン
├── project-improvements.md  # 改善履歴と学習事項
├── common-patterns.md       # よく使うコマンドや実装パターン
├── debug-log.md            # 重要なデバッグ記録
└── debug/                  # 一時的なデバッグファイル
    ├── sessions/          # セッション固有のログ
    ├── temp-logs/         # 作業中の一時ファイル
    └── archive/           # 解決済み問題のアーカイブ
```

### 各ファイルの役割

#### context.md
- プロジェクトの目的、技術スタック、制約事項を記録
- API情報、認証情報、料金プランなどの基本情報を管理

#### project-knowledge.md
- アーキテクチャの決定事項
- 実装パターンのベストプラクティス
- 避けるべきアンチパターン
- ライブラリ選定の理由

#### project-improvements.md
- 問題と解決策の履歴
- 試行錯誤の記録
- 学んだ教訓
- 今後の改善予定

#### common-patterns.md
- よく使うコマンド集
- 再利用可能な実装パターン
- コンポーネントテンプレート
- API呼び出しパターン

#### debug-log.md
- エラーと解決方法の記録
- デバッグTips
- 現在追跡中の問題
- 解決済みの重要な問題

### 重要な注意事項

⚠️ **ClaudeCodeを使用する際は必ず以下を確認してください**:

1. **新機能開発前**: `.claude/context.md`でプロジェクトの制約を確認
2. **実装時**: `.claude/common-patterns.md`で既存パターンを参照
3. **エラー発生時**: `.claude/debug-log.md`で類似問題の解決策を確認
4. **改善作業後**: `.claude/project-improvements.md`に記録を追加

この知見管理システムにより、開発効率の向上と品質の一貫性を保ちます。

あなたはwindows環境で起動された、ClaudeCodeです。
WSL版のClaudeCodeではありません。

私への回答は日本語で行ってください。

## supabase
Direct connection
postgresql://postgres:[YOUR-PASSWORD]@db.mockfjcakfzbzccabcgm.supabase.co:5432/postgres

Transaction pooler
postgresql://postgres.mockfjcakfzbzccabcgm:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

Session pooler
postgresql://postgres.mockfjcakfzbzccabcgm:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

[YOUR-PASSWORD]の部分は"sanri3159"です。

Project name
Paintly

Project ID
mockfjcakfzbzccabcgm

anonAPI Keys
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDA5MDgsImV4cCI6MjA3MzAxNjkwOH0.Y1cSlcOIKJMTa5gjf6jsoygphQZSMUT_xxciNVIMVoM"

service_role
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2tmamNha2Z6YnpjY2FiY2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MDkwOCwiZXhwIjoyMDczMDE2OTA4fQ.JZnPLDSxp3irtIMKC8LPCE-60or_fl8OCOVU4jpnnlk"

access-token sbp_cae2c23321261aa723b0eb620c6b046fc3eaf92a

supabase MCP token↓
sbp_cae2c23321261aa723b0eb620c6b046fc3eaf92a

URL Configuration

Site URL
http://172.17.161.101:9090


## Gemini
GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w

## MCP
Supabase MCP - データベース連携用
Playwright MCP - ブラウザ自動化テスト用
Chrome DevTools MCP - リアルタイムブラウザデバッグ・パフォーマンス分析用（Google公式2025年9月リリース）
filesystem MCP - ファイルシステムアクセス用
Desktop Commander - デスクトップ操作用
Github MCP - GitHub連携用
Context7 MCP - コンテキスト管理用
serena MCP
Cipher MCP
Vercel MCP
上記が接続されているすべてのMCPサーバーです。
上手く活用してください。

機能を実装する際は、既にその機能が実装されていないかSerenaMCPなどで確認してから行ってください。
ClaudeCodeが忘れているだけかもしれないので。

WEB検索を活用して、最新の実装方法などを調べる事も大事です。

Vercelトークン
JQmd56rPfQAMp7Wu05Wyrnqt

## Google OAuth
Google OAuth認証は有効になっています。
認証情報はVercelの環境変数で管理されています。

### 📡 接続成功MCPサーバー機能詳細

#### 🗄️ Database & Storage
**Supabase MCP** (`@supabase/mcp-server-supabase`)
- PostgreSQLデータベース操作（テーブル作成・更新・削除）
- 認証・ユーザー管理
- リアルタイムサブスクリプション
- ストレージ機能（ファイルアップロード・管理）
- Edge Functions実行
- プロジェクト設定管理
- Supabaseの設定はMCPサーバーを使って効率的に実装してください

#### 💻 Development Tools
**chunk-editor MCP** (Python 3.11環境)
- セマンティックチャンクベースのファイル編集
- Universal CTags利用による構造解析
- 関数・クラス単位での効率的なコード編集
- 安全なundo機能付き
- LLM向けに最適化されたファイル操作

**serena MCP** (`uvx serena-mcp-server`)
- セマンティックコード検索・解析
- シンボル参照関係の追跡
- インテリジェントなコード編集
- プロジェクト構造の理解と操作
- 効率的なトークン使用量でのコード操作

**Desktop Commander MCP** (`@wonderwhy-er/desktop-commander`)
- システムターミナル制御
- プロセス管理（実行・監視・終了）
- ファイルシステム検索
- diff形式でのファイル編集
- 長時間実行コマンドの管理
- OS全体にわたる統合操作

**ripgrep MCP** (`mcp-ripgrep`)
- 高速テキスト検索（rg使用）
- 正規表現サポート
- ファイルタイプフィルタリング
- 大規模コードベース対応
- コンテキスト行表示

#### 🔍 Code Intelligence & Documentation
**Context7 MCP** (`@upstash/context7-mcp`)
- ライブラリ・フレームワークの最新ドキュメント取得
- バージョン固有の情報提供
- コード例とベストプラクティス
- API仕様書の自動取得
- 開発効率向上のための情報支援

**Sourcegraph MCP** (`sourcegraph-mcp-server`)
- 大規模コードベース横断検索
- シンボル定義・参照検索
- コードナビゲーション
- セキュリティ脆弱性検索
- オープンソースコード解析

**GitHub MCP** (`@modelcontextprotocol/server-github`)
- リポジトリ管理（作成・削除・設定）
- イシュー・プルリクエスト操作
- コミット履歴管理
- ファイル操作（読み取り・更新）
- ブランチ管理
- GitHub API全般アクセス

#### 🧠 AI Enhancement & Memory
**cipher MCP** (`@byterover/cipher`)
- AIエージェント用メモリレイヤー
- 推論プロセスの記録・追跡
- 学習履歴の保存・検索
- マルチセッション間でのコンテキスト共有
- 知識グラフ構築
- エージェント行動パターン分析

#### 🛠️ Infrastructure & Deployment
**Vercel MCP** (Vercel API経由)
- プロジェクトデプロイメント
- 環境変数管理
- ドメイン設定
- ビルド設定・ログ確認
- パフォーマンス監視
- 本番環境管理

**filesystem MCP** (`@modelcontextprotocol/server-filesystem`)
- 安全なファイルシステムアクセス
- ディレクトリ操作
- ファイル読み取り・書き込み
- 権限管理
- プロジェクトフォルダ限定アクセス

#### 🔧 Testing & Browser Automation
**Playwright MCP** (`@playwright/mcp`)
- ブラウザ自動化（Chrome・Firefox・Safari）
- E2Eテスト実行
- スクリーンショット・動画記録
- フォーム操作・クリック処理
- ネットワーク監視
- モバイルデバイスエミュレーション

**Chrome DevTools MCP** (`chrome-devtools-mcp@latest`)（🆕 Google公式2025年9月リリース）
- リアルタイムChromeブラウザ制御・検査
- パフォーマンストレース記録・分析
- DOM/CSS状態のリアルタイム検査
- JavaScript実行・コンソール出力読取
- ネットワークリクエスト監視・分析
- ユーザーフロー自動化
- AI駆動デバッグ・最適化支援
- Chrome DevTools Protocol（CDP）フル活用

#### 🔥 高効率開発のためのMCP連携パターン

**パターン1: 情報収集 → 実装 → テスト**
1. Context7 MCP: 技術情報収集
2. serena MCP: 既存コード理解
3. chunk-editor MCP: コード実装
4. Playwright MCP: 動作確認

**パターン2: 問題解決 → 記録**
1. ripgrep MCP: 問題箇所検索
2. Sourcegraph MCP: 解決策調査
3. Desktop Commander MCP: 修正実行
4. cipher MCP: 解決プロセス記録

**パターン3: データ連携開発**
1. Supabase MCP: DB設計
2. GitHub MCP: APIコード管理
3. Vercel MCP: 環境構築
4. filesystem MCP: 設定ファイル管理

#### 🎯 Chrome DevTools MCP vs Playwright MCP 使い分けガイド

##### Chrome DevTools MCPを使うべき場合
**パフォーマンス分析が必要な時**
- ページロード時間の詳細分析（First Paint、LCP、CLS等の計測）
- JavaScript実行時間のボトルネック特定
- メモリリーク調査・ヒープスナップショット分析
- レンダリング最適化（60fps維持の確認、リフロー/リペイント最小化）

**高度なデバッグが必要な時**
- ブレークポイント設定によるステップ実行デバッグ
- JavaScript例外のリアルタイム監視
- コンソールログの詳細分析（エラー、警告、情報の分類）
- イベントリスナー・DOM変更の追跡

**ネットワーク最適化が必要な時**
- API呼び出しのタイミング・レスポンス時間分析
- バンドルサイズ最適化の効果測定
- キャッシュ戦略の検証
- WebSocket通信のリアルタイム監視

**リアルタイムインスペクションが必要な時**
- CSS計算値の確認・動的スタイル変更
- アクセシビリティツリーの検証
- セキュリティヘッダーの確認
- Service Worker/PWAの動作検証

##### Playwright MCPを使うべき場合
**E2Eテスト実行時**
- 複数ページにまたがる操作フローのテスト
- ユーザー認証フローの自動化
- フォーム送信の検証
- ファイルアップロード/ダウンロードのテスト

**クロスブラウザ検証時**
- Chrome、Firefox、Safari、Edgeでの動作確認
- モバイルデバイスエミュレーション（iPhone、Android）
- レスポンシブデザインの検証
- タッチ操作のシミュレーション

**視覚的検証が必要な時**
- スクリーンショット比較による回帰テスト
- 動画記録による操作証跡の保存
- PDF生成機能のテスト
- 画像差分検出

**並列実行・CI/CD統合時**
- 複数テストケースの並列実行
- GitHub Actions/Jenkins連携
- ヘッドレスモードでの自動テスト
- テストレポート生成

##### 両方を組み合わせるべき場合
**包括的品質保証が必要な時**
```javascript
// 例：新機能リリース前の総合検証
1. Playwright MCP: 機能テストシナリオ実行
2. Chrome DevTools MCP: パフォーマンス計測
3. Playwright MCP: 視覚的回帰テスト
4. Chrome DevTools MCP: メモリリーク確認
```

**問題の原因調査時**
```javascript
// 例：「特定操作でアプリが重くなる」問題
1. Playwright MCP: 問題再現手順の自動化
2. Chrome DevTools MCP: パフォーマンストレース記録
3. Chrome DevTools MCP: メモリ/CPU使用状況分析
4. Playwright MCP: 修正後の動作確認
```

##### Paintlyプロジェクトでの具体的使用例
**Chrome DevTools MCPの活用**
- Gemini API呼び出しのレスポンス時間最適化
- 画像生成時のメモリ使用量監視
- モバイル端末での描画パフォーマンス向上
- Supabase接続のネットワーク最適化

**Playwright MCPの活用**
- 顧客ページ作成フローの自動テスト
- 色選択・プレビュー機能の検証
- ビフォーアフタースライダーの動作確認
- 料金プラン切り替えのE2Eテスト

#### 📝 Chrome DevTools MCP セットアップと注意事項

##### インストールコマンド
```bash
# ClaudeCodeへの追加
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# オプション付きインストール（推奨）
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest --isolated --headless
```

##### 設定オプション
**基本オプション**
- `--headless`: UIなしモード（CI/CD環境向け）
- `--isolated`: 一時的なuser-data-dirを使用（セキュリティ向上）
- `--channel`: Chrome版選択（stable/canary/beta/dev）
- `--browserUrl`: 既存のChromeインスタンスに接続
- `--executablePath`: カスタムChrome実行ファイルパス指定



##### トラブルシューティング
**接続エラーが発生する場合**
1. Chromeが最新版か確認: `google-chrome --version`
2. ポートが使用中でないか確認: `lsof -i:9222`
3. ファイアウォール設定確認
4. サンドボックス無効化: `--no-sandbox` オプション追加

**パフォーマンストレースが取得できない場合**
1. DevToolsプロトコルが有効か確認
2. 十分なメモリがあるか確認（最低2GB推奨）
3. トレース時間を短縮（デフォルト5秒→3秒）

**メモリ不足エラー**
```javascript
// ヒープサイズ増加
process.env.NODE_OPTIONS = '--max-old-space-size=4096'
```

##### 実践的な使用例
**パフォーマンス監視スクリプト**
```javascript
// Paintlyアプリのパフォーマンス定期監視
const monitorPerformance = async () => {
  // 1. ページロード時間計測
  // 2. 画像生成APIレスポンス時間
  // 3. メモリ使用量追跡
  // 4. レポート生成
}
```

**デバッグワークフロー**
```javascript
// 問題：「画像生成後、アプリが遅くなる」
1. Chrome DevTools MCP: JavaScriptプロファイル開始
2. 問題の操作を実行（画像生成）
3. Chrome DevTools MCP: プロファイル停止・分析
4. ボトルネック特定（例：大量のDOMノード生成）
5. 修正実装
6. Chrome DevTools MCP: 修正後の計測で改善確認
```

##### ベストプラクティス
**効率的な使用方法**
- 本番環境では`--headless`モード使用
- 開発環境では視覚的フィードバックのため通常モード
- パフォーマンス計測時は他のアプリケーション終了
- トレース保存機能で比較分析を実施

**セキュリティ考慮事項**
- `--isolated`モードでクッキー・履歴の分離
- 機密情報を含むページでは使用注意
- 本番環境のクレデンシャルは使用しない
- VPN環境では接続設定の調整が必要な場合あり


色選択実装用カラーネーム、コードまとめ↓
C:\Users\elmod\Desktop\CursorApp\Paintly\docs\Color.md

## 🎓 重要な学習事項

開発中に遭遇した重要な学習事項と注意点をまとめたドキュメントを作成しました：

📖 **[CLAUDE_LEARNING.md](./CLAUDE_LEARNING.md)** - 重要な学習事項・開発上の注意点

主な内容：
- Next.js 15の破壊的変更（paramsがPromise型に）
- Supabase権限モデル（anon key vs service_role key）
- Service Workerのキャッシュ問題と解決方法
- 効率的なデバッグ手順
- Vercelデプロイメントのトラブルシューティング
