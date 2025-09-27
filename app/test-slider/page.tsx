'use client'

import { useState } from 'react'

import { ImageComparison } from '@/components/image-comparison'
import { HierarchicalColorSelector } from '@/components/hierarchical-color-selector'
import { getColorById } from '@/lib/hierarchical-paint-colors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestSliderPage() {
  // 実際のデータベースから取得した有効な画像URL
  const originalImageUrl = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/original_1757911784752.jpeg"
  const generatedImageUrl = "https://mockfjcakfzbzccabcgm.supabase.co/storage/v1/object/public/generated-images/e7078ac4-f843-4026-921d-b869ba37d335/generated_d96f9a2e-890f-481d-b902-7a8a0c7ae837.png"

  // 階層型色選択システムのテスト用状態
  const [wallColorId, setWallColorId] = useState<string>('')
  const [roofColorId, setRoofColorId] = useState<string>('')
  const [doorColorId, setDoorColorId] = useState<string>('')

  const wallColor = wallColorId ? getColorById(wallColorId) : null
  const roofColor = roofColorId ? getColorById(roofColorId) : null
  const doorColor = doorColorId ? getColorById(doorColorId) : null

  console.log('🧪 Test Slider Page - URLs:', {
    originalImageUrl,
    generatedImageUrl,
    originalLength: originalImageUrl?.length,
    generatedLength: generatedImageUrl?.length
  })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ヘッダー */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🧪 ReactCompareSlider 動作テスト
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

        {/* テスト用 ImageComparison */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">1. 実際のデータベース画像でのテスト</h2>

          <ImageComparison
            originalImage={originalImageUrl}
            generatedImage={generatedImageUrl}
            title="データベースの実画像 - ビフォーアフター比較"
            allowDownload={true}
          />
        </div>

        {/* 追加のデバッグ情報 */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">画像URL検証:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={originalImageUrl ? "text-green-600" : "text-red-600"}>
                      {originalImageUrl ? "✅" : "❌"}
                    </span>
                    <span>Original Image URL exists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={generatedImageUrl ? "text-green-600" : "text-red-600"}>
                      {generatedImageUrl ? "✅" : "❌"}
                    </span>
                    <span>Generated Image URL exists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={originalImageUrl?.startsWith('http') ? "text-green-600" : "text-red-600"}>
                      {originalImageUrl?.startsWith('http') ? "✅" : "❌"}
                    </span>
                    <span>Original URL is valid HTTP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={generatedImageUrl?.startsWith('http') ? "text-green-600" : "text-red-600"}>
                      {generatedImageUrl?.startsWith('http') ? "✅" : "❌"}
                    </span>
                    <span>Generated URL is valid HTTP</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ReactCompareSlider 確認項目:</h4>
                <div className="space-y-1 text-sm">
                  <p>• 左側（itemOne）= 元画像が表示されているか</p>
                  <p>• 右側（itemTwo）= 生成画像が表示されているか</p>
                  <p>• スライダーハンドルが中央に表示されているか</p>
                  <p>• スライダーをドラッグして境界線を移動できるか</p>
                  <p>• onlyHandleDraggable=trueでハンドルのみドラッグ可能か</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* 階層型色選択システムのテスト */}
        <div className="space-y-6 border-t pt-8">
          <h2 className="text-xl font-semibold">🎨 階層型色選択システム テスト</h2>
          
          {/* 色選択セクション */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 壁の色選択 */}
            <div>
              <HierarchicalColorSelector
                usage="wall"
                label="壁の色"
                selectedColorId={wallColorId}
                onColorSelect={setWallColorId}
              />
            </div>

            {/* 屋根の色選択 */}
            <div>
              <HierarchicalColorSelector
                usage="roof"
                label="屋根の色"
                selectedColorId={roofColorId}
                onColorSelect={setRoofColorId}
              />
            </div>

            {/* ドアの色選択 */}
            <div>
              <HierarchicalColorSelector
                usage="door"
                label="ドアの色"
                selectedColorId={doorColorId}
                onColorSelect={setDoorColorId}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}