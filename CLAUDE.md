# Paintly - 塗装会社向けカラーチェンジツール開発仕様書

## プロジェクト概要

### アプリケーション名
**Paintly（ペイントリー）**
- Paint + Instantly の造語（「塗装を瞬時に」）
- Grammarly、Calendlyのような成功したSaaS命名法を採用
- グローバル展開可能な発音しやすく覚えやすい名称

### 目的
塗装会社の営業担当者が顧客宅を訪問した際に、その場で建物の写真を撮影し、AIモデル「gemini-2.5-flash-image」（安定版）を使用して瞬時に塗装後の仕上がり画像を生成・提示することで、営業成約率を向上させるツール。

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
  - 豊富な色から自由に選択可能

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

**例: 色選択時**
```
壁の色は、選択された色（R.G.B: xxx xxx xxx ・16進数カラーコード: #XXXXXX）に変更してください。
```

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
- **AI統合**: Google AI Studio API (gemini-2.5-flash-image) - 安定版
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

Stripe↓
公開可能キー: [STRIPE_PUBLISHABLE_KEY - 環境変数で管理]
シークレットキー: [STRIPE_SECRET_KEY - 環境変数で管理]

※セキュリティ上、実際のキーはVercelの環境変数および.env.localで管理しています

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


色選択実装用カラーコードまとめ↓
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

---

# ✅ 実装済み機能一覧（フェーズ1完了）

**重要**: 以下の機能はすべて実装・デプロイ済みです。新機能を追加する前に、この一覧を確認してください。

## 📋 法的コンプライアンス（完全実装）

### 1. 利用規約ページ（app/terms/page.tsx）
- **URL**: https://www.paintly.pro/terms
- **内容**:
  - サービス定義と範囲
  - アカウント登録要件
  - 月額制サブスクリプション決済
  - キャンセルポリシー
  - 禁止事項
  - 知的財産権（生成画像の著作権は利用者に帰属）
  - 責任制限
  - 管轄裁判所（東京地方裁判所）
  - 全16条の詳細な利用規約

### 2. プライバシーポリシー（app/privacy/page.tsx）
- **URL**: https://www.paintly.pro/privacy
- **内容**:
  - 個人情報保護法準拠
  - 収集データ: メールアドレス、パスワード、アップロード画像、決済情報
  - 第三者サービス開示:
    - Supabase（米国）- データベース・認証
    - Stripe（米国）- 決済処理
    - Google Gemini（米国）- AI画像生成
    - Vercel（米国）- ホスティング
  - Cookie使用とトラッキング
  - ユーザー権利（開示、訂正、削除等の請求）
  - プラン別データ保存期間
  - 18歳未満利用不可

### 3. 特定商取引法表記（app/legal/page.tsx）
- **URL**: https://www.paintly.pro/legal
- **内容**:
  - 事業者名: 村上 ダニエル（個人事業主）
  - 運営責任者: 請求時開示
  - 所在地: 請求時開示（プライバシー保護）
  - お問い合わせ: sanri.3159@gmail.com
  - 全プラン価格表示（無料、2,980円、5,980円、9,980円、19,800円）
  - 支払方法: Stripe（クレジット/デビットカード）
  - 支払時期: 即時決済、月次自動更新
  - サービス提供時期: 支払完了直後
  - 返品・キャンセル: デジタルコンテンツのため返金不可
  - 解約方法: サービス設定から、次回請求日前に実行
  - 動作環境: Chrome, Safari, Edge, Firefox（最新版）
  - 注意事項: AI生成の免責事項

### 4. 法的フッターコンポーネント（components/legal-footer.tsx）
- サイト全体で法的ページへのリンク提供
- 2つのバリエーション: full（詳細フッター）、minimal（シンプル）
- ブランド情報、サービスリンク、著作権表示

## 📄 PDFエクスポート機能（完全実装）

### 1. PDF生成ライブラリ（lib/pdf-export.ts）
- **jsPDF使用** - クライアントサイドPDF生成
- **日本語フォント対応**: NotoSansJP-Regular.ttf
- **フォントキャッシング**: パフォーマンス最適化
- **2つのエクスポート機能**:
  - `exportSingleGenerationToPdf()`: 単一生成のPDF出力（2ページ）
    - 1ページ目: 元画像
    - 2ページ目: 生成画像
    - タイトル、日付、色情報表示
  - `exportMultipleGenerationsToPdf()`: 複数生成の一括PDF出力
    - カバーページ付き
    - 各生成を見開きで左右比較表示
    - ページ番号フッター
- **画像処理**: API経由でBase64変換（CORS回避）
- **使用箇所**: 顧客ページ履歴、ダッシュボード

### 2. 型定義（lib/pdf-export-types.ts）
- `ExportImageData`: エクスポートデータ構造
- 色情報、画像URL、生成設定を含む

## 🖼️ 画像生成・処理機能（完全実装）

### 1. AI統合（lib/ai-providers/）
- **Gemini Provider** (gemini-provider.ts): Google Generative AI統合
- **プロバイダーマネージャー** (provider-manager.ts): 複数AIプロバイダー抽象化
- **統一インターフェース** (types.ts): 将来的な拡張性確保
- **環境変数チェック**: 利用可能プロバイダー自動判定

### 2. 画像処理（lib/）
- **image-processing.ts**: 画像リサイズ、圧縮、最適化
- **image-collage.ts**: Canvas APIを使用した複数画像結合
  - `createImageCollage()`: 縦並びレイアウト
  - `createImageCollageGrid()`: 2列グリッドレイアウト
  - CORS対応、背景色カスタマイズ
  - JPEG形式（品質90%）出力

### 3. 色選択システム（lib/）
- **paint-colors.ts**: カラーデータベース
- **hierarchical-paint-colors.ts**: 階層的カラー分類
- **web-colors.ts**: Web標準色対応
- **color-history.ts**: ユーザー色選択履歴管理

### 4. 画像比較UI（components/）
- **image-comparison.tsx**: ビフォーアフター比較スライダー
- **image-comparison-fixed.tsx**: 修正版スライダー
- **image-comparison-grid.tsx**: グリッドビュー
- react-compare-slider統合
- react-zoom-pan-pinch統合（ズーム機能）

## 👥 認証・セキュリティ機能（完全実装）

### 1. 認証システム（app/auth/）
- **サインイン** (signin/page.tsx): メールOTP認証
- **サインアップ** (signup/page.tsx): 新規登録
- **パスワードリセット** (reset-password/page.tsx): パスワード再設定
- **コールバック** (callback/route.ts): OAuth認証コールバック
- **Google OAuth**: 有効化済み

### 2. MFA/2FA機能（components/mfa-setup.tsx）
- **TOTP（時間ベースワンタイムパスワード）**
- QRコード生成（qrcodeライブラリ）
- Authenticatorアプリ対応:
  - Google Authenticator
  - Microsoft Authenticator
  - 1Password
  - Authy
- 複数デバイス登録可能（最大10デバイス）
- 登録/無効化機能
- バックアップデバイス推奨UI

### 3. セキュリティ対策（lib/security.ts）
- **Content Security Policy (CSP)**: 厳格なセキュリティヘッダー
- **レート制限**: RateLimiterクラス（10回/分）
- **CSRF対策**: トークン生成・検証
- **入力サニタイゼーション**: XSS対策
- **ファイルアップロード検証**:
  - 最大10MB
  - JPEG, PNG, WebPのみ許可
  - ファイル名検証（ディレクトリトラバーサル対策）
- **APIキー検証**: 形式チェック
- **IPアドレス取得**: Cloudflare, X-Forwarded-For対応
- **セッション検証**: 有効期限チェック
- **セキュアトークン生成**: 暗号学的に安全な乱数

### 4. エラー管理システム（lib/）
- **error-management.ts**: 高度なエラーハンドリング
  - ErrorLoggerクラス（最大100件保持）
  - RetryManagerクラス（指数バックオフ、最大3回）
  - OfflineManagerクラス（オフライン時キューイング）
  - グローバルエラーハンドリング
  - エラー統計情報
- **error-tracker.ts**: エラー追跡
- **error-analysis.ts**: エラー分析
- **notification-engine.ts**: エラー通知システム（1100行以上）
  - 複数チャンネル対応: Slack, Email, Discord, Webhook
  - レート制限（maxPerHour, cooldownMinutes）
  - 重複防止（Suppression cache）
  - 頻度追跡
  - エスカレーションルール
  - 通知履歴（最大100件、7日間保持）

## 💳 決済・サブスクリプション（完全実装）

### 1. Stripe統合（app/api/stripe/）
- **Webhook** (webhook/route.ts): Stripeイベント処理
  - checkout.session.completed
  - customer.subscription.created/updated/deleted
  - invoice.payment_succeeded（生成回数リセット）
  - invoice.payment_failed（ステータスをpast_dueに）
  - シグネチャ検証
  - Supabase Admin Client使用（RLSバイパス）
- **チェックアウトセッション作成** (create-checkout-session/route.ts)
- **キャンセル処理** (cancel-subscription/route.ts)
- **カスタマーポータル** (app/api/create-portal-session/route.ts)

### 2. 料金プラン管理（lib/pricing-plans.ts）
- 無料プラン: 3回、7日間保存
- ライトプラン: 2,980円、30回/月、1ヶ月保存
- スタンダードプラン: 5,980円、100回/月、3ヶ月保存
- プロプラン: 9,980円、300回/月、6ヶ月保存
- ビジネスプラン: 19,800円、1,000回/月、1年保存
- Stripe Price ID統合

### 3. プラン警告システム（lib/plan-warning.ts）
- 4段階警告レベル: safe, warning, critical, exceeded
- 使用率ベース警告（80%以上）
- 残り回数ベース警告（3回以下、1回、0回）
- 色分けプログレスバー
- アップグレード促進UI

### 4. 請求ページ（app/billing/page.tsx）
- 現在のプラン表示
- プラン変更UI
- Stripe Customer Portalリンク
- 使用状況表示

## 📊 データベース（完全実装）

### スキーマ（types/database.ts）

1. **users**: ユーザー基本情報
   - id, email, name, avatar_url, timestamps

2. **plans**: 料金プラン
   - id, name, price, generation_limit, customer_page_limit, storage_days, features

3. **subscriptions**: サブスクリプション
   - id, user_id, plan_id, status (active/canceled/past_due/trialing)
   - stripe_subscription_id, stripe_customer_id, generation_count
   - current_period_start, current_period_end

4. **customers**: 顧客情報
   - id, user_id, title, customer_name, address, phone, email, notes

5. **images**: 画像
   - id, customer_id, user_id, image_type (original/generated/side)
   - url, storage_path, mime_type, size_bytes, width, height, metadata

6. **generation_history**: 生成履歴
   - id, customer_id, user_id, original/generated/side image IDs
   - wall/roof/door colors（色名 + カラーコード）
   - weather, layout_side_by_side, background_color, other_instructions
   - prompt, gemini_model, gemini_response
   - status (pending/processing/completed/failed)
   - error_message, processing_time_ms

## 🎨 UI・コンポーネント（完全実装）

### 主要コンポーネント（components/）

1. **sidebar.tsx**: サイドバーナビゲーション
   - 顧客ページリスト（検索機能付き）
   - プラン使用状況ゲージ
   - 上限警告システム
   - 設定メニュー
   - チュートリアル再起動

2. **color-selector系**:
   - color-selector.tsx
   - web-color-selector.tsx
   - compact-color-selector.tsx
   - hierarchical-color-selector.tsx
   - color-palette.tsx, color-palette-selector.tsx

3. **generation-history.tsx**: 生成履歴表示
   - グリッド/リストビュー切り替え
   - PDFエクスポートボタン
   - 画像プレビュー

4. **generation-settings.tsx**: 生成設定UI
   - 色選択
   - 天候選択
   - レイアウトオプション

5. **image-upload.tsx**: 画像アップロード
   - react-dropzone統合
   - ドラッグ&ドロップ対応
   - プレビュー表示

6. **contact-form-modal.tsx**: お問い合わせフォーム
   - モーダル形式
   - バリデーション付き

7. **tutorial-modal.tsx**: チュートリアルシステム
   - 初回利用ガイド
   - 機能説明

8. **エラー関連**:
   - error-boundary.tsx
   - enhanced-error.tsx
   - enhanced-loading.tsx
   - error-dashboard.tsx
   - error-resolution-dashboard.tsx

9. **通知設定**:
   - notification-settings-dashboard.tsx
   - MFA設定: mfa-setup.tsx, mfa-verify.tsx
   - qr-code-modal.tsx

10. **ダッシュボード**:
    - dashboard-stats-cards.tsx
    - dashboard-recent-generations.tsx
    - dashboard-skeleton.tsx

11. **UI基本コンポーネント** (components/ui/):
    - Radix UI完全統合
    - shadcn/uiテーマ
    - 20+ コンポーネント（button, card, dialog, input等）

## 🔗 共有機能（完全実装）

### 画像共有（app/share/[id]/）
- **URL**: https://www.paintly.pro/share/[id]
- 署名付きURL生成
- 有効期限管理（expires_at）
- アクセスカウント追跡
- 複数画像共有対応
- ダウンロード機能
- レスポンシブギャラリー
- モバイル対応（長押し保存ガイド）
- ダークモード対応

### 共有API（app/api/share/）
- 共有リンク作成（create/route.ts）
- 共有データ取得（[id]/route.ts）

## 📱 PWA機能（完全実装）

### 1. マニフェスト（public/manifest.json）
- アプリ名: Paintly - 塗装シミュレーションツール
- スタンドアローンモード
- アイコン: 192x192, 512x512
- ショートカット:
  - 新規シミュレーション → /dashboard
  - 料金プラン → /billing
- スクリーンショット2枚
- Share Target API対応（画像共有）
- カテゴリ: business, productivity
- 日本語対応（lang: "ja"）

### 2. PWA機能（lib/pwa.ts）
- Service Worker登録と自動更新
- インストールプロンプト処理
- プッシュ通知権限とサブスクリプション
- オンライン/オフライン状態監視
- バージョン更新通知

## 🧪 テスト環境（完全実装）

### テストインフラ（package.json）

1. **Jest** - ユニット/統合テスト
   - `test:unit`: APIコンポーネントライブラリテスト
   - `test:integration`: 統合テスト
   - `test:coverage`: カバレッジレポート
   - **カバレッジ目標**:
     - Lines: 85%
     - Functions: 85%
     - Branches: 80%
     - Statements: 85%

2. **Playwright** - E2Eテスト
   - `test:e2e`: E2Eテスト実行
   - `test:e2e:ui`: UIモード
   - `test:e2e:headed`: ヘッド付きモード
   - `test:e2e:debug`: デバッグモード
   - `test:performance`: パフォーマンステスト
   - `test:accessibility`: アクセシビリティテスト
   - `test:security`: セキュリティテスト

3. **Testing Library**
   - @testing-library/react
   - @testing-library/jest-dom
   - @testing-library/user-event

## 🔧 APIルート（完全実装）

### 認証関連（app/api/auth/）
- check-account-status/route.ts
- reset-login-failures/route.ts
- track-login-failure/route.ts
- verify-recaptcha/route.ts

### 画像生成関連（app/api/）
- generate/route.ts: AI画像生成
- test-generate/route.ts: テスト用
- image-to-base64/route.ts: 画像変換（CORS回避）
- download-image/route.ts: 画像ダウンロード

### 顧客管理（app/api/）
- customer/[id]/route.ts: 顧客CRUD
- add-missing-customers/route.ts: データ修復

### プラン・使用状況（app/api/）
- check-generation-limit/route.ts: 上限チェック
- increment-generation-count/route.ts: 使用回数カウント

### エラー管理（app/api/）
- error-reporting/route.ts: エラー報告
- error-resolution/route.ts: エラー解決
- notification-settings/route.ts: 通知設定

### その他（app/api/）
- ai-providers/route.ts: AIプロバイダー情報
- send-inquiry-email/route.ts: お問い合わせメール
- templates系: テンプレート管理
- debug系: デバッグ用エンドポイント

## 📄 ページ（完全実装）

### メインページ（app/）
- page.tsx: ランディングページ
- dashboard/page.tsx: ダッシュボード
- customer/[id]/page.tsx: 顧客ページ（メイン機能）
- customer/new/page.tsx: 新規顧客作成
- settings/page.tsx: 設定ページ
- billing/page.tsx: 請求管理
- pricing/page.tsx: 料金プラン表示
- setup/page.tsx: 初期設定

### 法的ページ（app/）
- terms/page.tsx: 利用規約
- privacy/page.tsx: プライバシーポリシー
- legal/page.tsx: 特定商取引法表記

### テストページ（app/test*/）
- test/page.tsx
- test-auth/page.tsx
- test-color-selector/page.tsx
- test-dashboard/page.tsx
- test-pdf/page.tsx
- test-sidebar/page.tsx
- test-simple-slider/page.tsx
- test-slider/page.tsx

### エラーページ（app/）
- error.tsx: エラーページ
- not-found.tsx: 404ページ
- loading.tsx: ローディングページ

### SEO（app/）
- sitemap.ts: サイトマップ生成
- robots.txt: クローラー制御

## 🛠️ 技術スタック（実装済み）

### フロントエンド
- **Next.js 15.1.4**: App Router、Server Components、Server Actions
- **React 18.3.1**: 最新機能
- **TypeScript 5.7.3**: 完全型安全
- **Tailwind CSS 3.4**: ユーティリティファースト
- **shadcn/ui**: Radix UI完全統合（20+コンポーネント）
- **Framer Motion 12**: アニメーション
- **Zustand 5**: 軽量状態管理
- **React Hook Form 7**: フォーム管理

### バックエンド
- **Next.js API Routes**: サーバーレス関数
- **Supabase**: PostgreSQL + 認証 + ストレージ
- **Stripe**: 決済・サブスクリプション
- **Google Generative AI**: Gemini統合
- **Resend**: メール送信

### 開発ツール
- **ESLint + Prettier**: コード品質
- **Jest + Playwright**: テスト
- **TypeScript**: 型チェック

### セキュリティ
- **CSP**: Content Security Policy
- **ReCAPTCHA v3**: ボット対策
- **CSRF対策**: トークン検証
- **レート制限**: 悪用防止

### パフォーマンス
- **Sharp**: サーバーサイド画像最適化
- **browser-image-compression**: クライアントサイド圧縮
- **PWA**: オフライン対応
- **Service Worker**: キャッシング

## 📝 重要な注意事項

### 新機能開発前の確認事項
1. ✅ **この一覧を必ず確認**: 機能が既に存在する可能性
2. ✅ **コードベース検索**: Serena MCPで既存実装を確認
3. ✅ **APIルート確認**: app/api/配下の既存エンドポイント
4. ✅ **コンポーネント確認**: components/配下の再利用可能部品
5. ✅ **ライブラリ確認**: lib/配下のユーティリティ関数

### 忘れないための記録
この実装済み機能リストは、前回「プライバシーポリシー、利用規約、特定商取引法表記、PDFエクスポートが実装されていない」と誤って報告した反省に基づいて作成されました。

**教訓**:
- 新機能開発前に必ず既存実装を確認する
- URLベースで機能の存在を確認する
- app/配下の全ディレクトリをglobして調査する
- lib/配下のユーティリティも見落とさない

### デプロイ先
- **本番**: https://www.paintly.pro
- **ホスティング**: Vercel
- **データベース**: Supabase (mockfjcakfzbzccabcgm)
- **決済**: Stripe
- **AI**: Google Gemini
