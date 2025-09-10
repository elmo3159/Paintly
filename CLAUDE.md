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
- 横から見た建物の写真アップロード（オプション）
  - 「横から見た建物の写真を添付すると精度が上がります（なくてもOK）」というガイドテキスト表示

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
- 選択肢: 晴れ、曇り、雨、雪

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

WSL環境で、ClaudeCodeを使用します。

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

## Gemini
GEMINI_API_KEY=AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w

## MCP
Supabase MCP - データベース連携用      
Playwright MCP - ブラウザ自動化テスト用
filesystem MCP - ファイルシステムアクセス用
Desktop Commander - デスクトップ操作用
Github MCP - GitHub連携用
Context7 MCP - コンテキスト管理用
serena
Cipher
上記が接続されているすべてのMCPサーバーです。
上手く活用してください。

機能を実装する際は、既にその機能が実装されていないかSerenaMCPなどで確認してから行ってください。
ClaudeCodeが忘れているだけかもしれないので。