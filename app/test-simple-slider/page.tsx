'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSimpleSliderPage() {
  const [sliderPosition, setSliderPosition] = useState(50)
  
  // 実際のデータベースから取得した有効な画像URL
  const originalImageUrl = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/original_1757911784752.jpeg"
  const generatedImageUrl = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/generated_d96f9a2e-890f-481d-b902-7a8a0c7ae837.png"

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ヘッダー */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🧪 シンプルスライダー 動作テスト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
              <p><strong>Original URL:</strong> {originalImageUrl}</p>
              <p><strong>Generated URL:</strong> {generatedImageUrl}</p>
              <p><strong>期待される動作:</strong> 左側に元画像、右側に生成画像が表示され、スライダーで比較可能</p>
            </div>
          </CardContent>
        </Card>

        {/* 自作シンプルスライダー */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">1. カスタムシンプルスライダーテスト</h2>

          <Card>
            <CardHeader>
              <CardTitle>自作ビフォーアフター比較スライダー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                {/* 元画像（背景全体） */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${originalImageUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                
                {/* 生成画像（クリップマスク付き） */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${generatedImageUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                  }}
                />
                
                {/* スライダーライン */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* スライダーハンドル */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
              
              {/* スライダーコントロール */}
              <div className="mt-4 space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-sm text-muted-foreground">
                  <p>スライダーを動かして比較してください</p>
                  <p className="text-xs">
                    左側：元画像 | 右側：生成画像（アフター）| 現在位置: {sliderPosition}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 個別画像確認 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>元画像（Original）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                  onLoad={() => console.log('✅ Original image loaded successfully')}
                  onError={(e) => console.error('❌ Original image failed to load:', e)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>生成画像（Generated）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="w-full h-full object-contain"
                  onLoad={() => console.log('✅ Generated image loaded successfully')}
                  onError={(e) => console.error('❌ Generated image failed to load:', e)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}