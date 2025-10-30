# Google Ads トラッキング実装ガイド

## 📋 実装済み機能

### 1. 基本トラッキングタグ（全ページ）
- Google タグ（gtag.js）がすべてのページに自動配置
- トラッキングID: `AW-17664021447`
- 配置場所: `app/layout.tsx` の `<head>` セクション

### 2. 自動コンバージョントラッキング

#### 新規会員登録
- **トリガー**: 新規ユーザーが初めてダッシュボードにアクセス
- **判定条件**: アカウント作成から5分以内
- **イベント名**: `sign_up`
- **実装場所**: `components/conversion-tracker.tsx`

## 🚀 追加実装が推奨されるコンバージョンイベント

### 1. 有料プラン購入（最重要）

**実装場所**: `app/api/stripe/webhook/route.ts`

```typescript
import { ConversionEvents } from '@/lib/google-ads'

// checkout.session.completed イベント内で
if (session.mode === 'subscription') {
  // サーバーサイドなので、クライアント側でトラッキング
  // オプション1: Webhookで購入情報をDBに保存し、次回ページ読み込み時にトラッキング
  // オプション2: リダイレクト先URLにクエリパラメータを付与
}
```

**推奨実装**: 購入成功ページ（`app/billing/success/page.tsx`を新規作成）

```typescript
'use client'

import { useEffect } from 'react'
import { ConversionEvents } from '@/lib/google-ads'
import { useSearchParams } from 'next/navigation'

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams()
  const planName = searchParams.get('plan')
  const amount = searchParams.get('amount')
  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    if (planName && amount) {
      ConversionEvents.purchase({
        planName,
        value: parseInt(amount),
        transactionId: transactionId || undefined,
      })
    }
  }, [planName, amount, transactionId])

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-4">購入完了</h1>
      <p>プランのアップグレードが完了しました。</p>
    </div>
  )
}
```

### 2. 画像生成完了

**実装場所**: `app/api/generate/route.ts` または 画像生成成功後のクライアント側

```typescript
import { ConversionEvents } from '@/lib/google-ads'

// 画像生成成功後
ConversionEvents.generateImage()
```

**推奨実装**: 顧客ページコンポーネント

```typescript
'use client'

import { ConversionEvents } from '@/lib/google-ads'

// 画像生成成功時のハンドラー内
const handleGenerationSuccess = () => {
  // ... 既存の処理
  ConversionEvents.generateImage()
}
```

### 3. その他のイベント

#### 顧客ページ作成
```typescript
import { ConversionEvents } from '@/lib/google-ads'

// 新規顧客ページ作成成功時
ConversionEvents.createCustomer()
```

#### お問い合わせフォーム送信
```typescript
import { ConversionEvents } from '@/lib/google-ads'

// フォーム送信成功時
ConversionEvents.contactSubmit()
```

#### 画像ダウンロード
```typescript
import { ConversionEvents } from '@/lib/google-ads'

// ダウンロードボタンクリック時
ConversionEvents.downloadImage()
```

#### プランアップグレード
```typescript
import { ConversionEvents } from '@/lib/google-ads'

// プラン変更成功時
ConversionEvents.upgradePlan({
  fromPlan: '無料プラン',
  toPlan: 'スタンダードプラン',
  value: 5980
})
```

## 📊 Google Ads 管理画面での確認方法

### 1. タグの動作確認

1. Google Ads にログイン
2. 「ツールと設定」→「測定」→「コンバージョン」を開く
3. 「タグ」タブで Google タグのステータスを確認
4. 「過去7日間にタグが検出されました」と表示されれば成功

### 2. リアルタイムデバッグ（推奨）

**Google Tag Assistant のインストール**
1. Chrome拡張機能「Tag Assistant」をインストール
2. Paintly（https://www.paintly.pro）にアクセス
3. Tag Assistantを開き、タグが正しく動作しているか確認

**ブラウザDevToolsでの確認**
```javascript
// コンソールで実行
window.dataLayer  // Google タグのデータレイヤーが存在するか確認
```

### 3. コンバージョン設定

Google Ads管理画面で以下のコンバージョンアクションを作成：

#### 会員登録（sign_up）
- コンバージョン名: 会員登録
- カテゴリ: リード
- 値: 1000円（推定生涯価値）
- カウント方法: 全件

#### 有料プラン購入（purchase）
- コンバージョン名: プラン購入
- カテゴリ: 購入
- 値: 動的（購入金額を使用）
- カウント方法: 全件

#### 画像生成（generate_image）
- コンバージョン名: 画像生成
- カテゴリ: エンゲージメント
- 値: 100円（エンゲージメント価値）
- カウント方法: 全件

## 🔍 トラブルシューティング

### タグが検出されない場合

1. **キャッシュをクリア**
   - ブラウザのキャッシュとCookieをクリア
   - Vercelのエッジキャッシュをクリア

2. **コンソールエラー確認**
   ```javascript
   // ブラウザのDevToolsコンソールで確認
   window.gtag  // 関数が存在するか
   window.dataLayer  // データレイヤーが存在するか
   ```

3. **Content Security Policy（CSP）確認**
   - `lib/security.ts` で `https://www.googletagmanager.com` が許可されているか確認

### コンバージョンが記録されない場合

1. **イベント名の確認**
   - Google Ads管理画面で設定したイベント名と一致しているか

2. **手動テスト**
   ```javascript
   // ブラウザコンソールで手動実行
   window.gtag('event', 'sign_up', { send_to: 'AW-17664021447' })
   ```

3. **localStorageの確認**
   ```javascript
   // 既にトラッキング済みかチェック
   localStorage.getItem('conversion_tracked_signup_[USER_ID]')
   ```

## 📈 パフォーマンス最適化

### 1. Script 読み込み戦略

現在の設定: `strategy="afterInteractive"`
- ページの初回インタラクティブ後に読み込み
- パフォーマンスへの影響を最小化

### 2. 非同期読み込み

```typescript
<Script
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js?id=AW-17664021447"
/>
```

- 非同期（async）属性により、ページレンダリングをブロックしない

## 🔐 プライバシー対応

### GDPR/Cookie同意

将来的な実装推奨：

```typescript
// Cookie同意後にトラッキング開始
if (userConsent) {
  ConversionEvents.signUp()
}
```

### 個人情報の保護

- ユーザーIDは暗号化されたSupabase UUIDを使用
- メールアドレス等の個人情報は送信していない

## 📚 参考リンク

- [Google タグのドキュメント](https://support.google.com/google-ads/answer/6331314)
- [コンバージョン トラッキングのベスト プラクティス](https://support.google.com/google-ads/answer/1722054)
- [Next.js Script コンポーネント](https://nextjs.org/docs/app/api-reference/components/script)

## ✅ チェックリスト

実装完了後、以下を確認してください：

- [ ] Google Ads管理画面でタグが検出されている
- [ ] 会員登録コンバージョンが記録されている
- [ ] Tag Assistantでタグ動作を確認済み
- [ ] 本番環境でテスト登録を実施
- [ ] Google Ads管理画面でコンバージョンアクションを設定
- [ ] 購入完了ページでpurchaseイベントを実装（推奨）
- [ ] 画像生成でgenerateImageイベントを実装（推奨）

---

**最終更新**: 2025-10-31
**実装バージョン**: v1.0.0
