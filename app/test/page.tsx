'use client'

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { ImageComparison } from '@/components/image-comparison'

export default function TestPage() {
  // 実際の画像URL
  const originalImage = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/original_1757911784752.jpeg"
  const generatedImage = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/generated_d96f9a2e-890f-481d-b902-7a8a0c7ae837.png"

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">スライダーテスト - モバイル対応版</h1>

      {/* 改善されたImageComparisonコンポーネント */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🔥 改善されたImageComparison（モバイル対応）</h2>
        <ImageComparison
          originalImage={originalImage}
          generatedImage={generatedImage}
          title="モバイル対応スライダー"
          allowDownload={true}
        />
      </div>

      {/* 元のReactCompareSlider（比較用） */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">📱 元のReact Compare Slider（比較用）</h2>
        <div className="w-full h-96 border border-gray-300 rounded">
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={originalImage}
                alt="元画像"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={generatedImage}
                alt="生成画像"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            }
            position={50}
            onlyHandleDraggable={true}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          左側：元画像 | 右側：生成画像 | 中央のハンドルをドラッグ
        </p>
      </div>

      {/* モバイルテスト情報 */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 モバイルテスト情報</h3>
        <ul className="text-sm space-y-1">
          <li>✅ スライダーハンドルサイズ: モバイル 12x12 / タブレット 10x10 / デスクトップ 8x8</li>
          <li>✅ タッチイベント: touchstart, touchmove, touchend 対応</li>
          <li>✅ 視覚的改善: 青いボーダー、中央インジケータ追加</li>
          <li>✅ モバイル専用UI: タッチ操作説明文、カラーコード表示</li>
          <li>✅ touch-none クラス: スクロール干渉を防止</li>
        </ul>
      </div>
    </div>
  )
}