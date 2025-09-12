# Gemini 2.5 Flash Image Preview API テストレポート

## 📅 実施日時
2025年9月12日

## 🎯 テスト目的
Paintlyアプリケーションで使用するGemini 2.5 Flash Image Preview API（nano-banana）の画像生成機能の動作確認

## ✅ テスト結果: **成功**

### 実施したテスト

1. **基本的な画像生成テスト** ✅
   - ファイル: `test-gemini-image.js`
   - Paintlyログイン画面用の背景画像生成
   - 結果: 981.95 KBの画像生成に成功

2. **シンプルな日本語プロンプトテスト** ✅
   - ファイル: `test-api-simple.js`
   - 日本の住宅街の風景生成
   - 結果: 1763.12 KBの画像生成に成功

3. **Base64エンコーディングテスト** ✅
   - ファイル: `test-api-base64.js`
   - 複数の塗装パターンでの画像生成
   - 結果: 全パターンで成功

## 🔑 重要な発見事項

### 正しいモデル名
```javascript
model: 'gemini-2.5-flash-image-preview'
```

### 必要なパッケージ
```bash
npm install @google/generative-ai
```
※ 旧パッケージ `@google-ai/generativeai` は廃止されているため注意

### APIキー
- 環境変数またはコード内で設定
- 本番環境では環境変数での管理を推奨

## 📝 実装サンプル

### 基本的な画像生成コード
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-image-preview'
});

async function generateImage(prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  // Extract Base64 image
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data; // Base64 encoded image
      }
    }
  }
}
```

## 🎨 生成された画像

1. **paintly-login-background.png** - Paintlyログイン画面背景
2. **test-image-1757649551036.png** - 日本の住宅街
3. **test-base64-house-with-blue-walls.png** - 青い壁の住宅
4. **test-base64-house-with-red-roof.png** - 赤い屋根の住宅

## 💰 コスト情報
- **料金**: $30.00 per 1M output tokens
- **1画像あたり**: 約1290 tokens（約$0.039/画像）

## 🚀 次のステップ

1. **Paintlyアプリケーションへの統合**
   - `/app/api/generate/route.ts` の更新
   - エラーハンドリングの強化
   - レスポンスフォーマットの統一

2. **パフォーマンス最適化**
   - 画像サイズの最適化
   - キャッシング戦略の実装

3. **プロンプトエンジニアリング**
   - 塗装色指定の精度向上
   - 日塗工番号との連携強化

## ⚠️ 注意事項

- Gemini 2.0 Flash の画像生成機能は2025年9月26日に廃止予定
- `gemini-2.5-flash-image-preview` への移行が必須
- 本番環境でのAPIキー管理に注意

## 📊 テスト統計

- **テスト実行数**: 3種類
- **生成画像数**: 4枚
- **成功率**: 100%
- **平均生成時間**: 約2-3秒/画像
- **平均画像サイズ**: 約1.4MB

## 結論

Gemini 2.5 Flash Image Preview API（nano-banana）は正常に動作し、Paintlyアプリケーションでの使用に適していることが確認されました。日本語プロンプトにも対応し、高品質な画像を生成できます。