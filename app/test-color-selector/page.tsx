'use client'

import { useState } from 'react'
import { HierarchicalColorSelector } from '@/components/hierarchical-color-selector'
import { getColorById } from '@/lib/hierarchical-paint-colors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestColorSelectorPage() {
  const [wallColorId, setWallColorId] = useState<string>('')
  const [roofColorId, setRoofColorId] = useState<string>('')
  const [doorColorId, setDoorColorId] = useState<string>('')

  const wallColor = wallColorId ? getColorById(wallColorId) : null
  const roofColor = roofColorId ? getColorById(roofColorId) : null
  const doorColor = doorColorId ? getColorById(doorColorId) : null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🎨 階層型色選択システム テスト
          </h1>
          <p className="text-gray-600">
            壁、屋根、ドア用途別の階層型色選択システムの動作をテストします
          </p>
        </div>

        {/* 選択された色の概要 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>選択された色の概要</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 壁の色 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">壁の色</h4>
                {wallColor ? (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: wallColor.hex }}
                    />
                    <div>
                      <div className="font-medium text-sm">{wallColor.name}</div>
                      <div className="text-xs text-gray-500">{wallColor.code}</div>
                      <div className="text-xs text-gray-400">{wallColor.hex}</div>
                      {wallColor.munsell && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {wallColor.munsell}
                        </Badge>
                      )}
                      {wallColor.difficulty && (
                        <Badge 
                          variant={wallColor.difficulty === '◆' ? 'destructive' : 'secondary'} 
                          className="text-xs mt-1 ml-1"
                        >
                          {wallColor.difficulty === '◆' ? '高難度' : '出にくい色'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg text-center text-gray-500 text-sm">
                    未選択
                  </div>
                )}
              </div>

              {/* 屋根の色 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">屋根の色</h4>
                {roofColor ? (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: roofColor.hex }}
                    />
                    <div>
                      <div className="font-medium text-sm">{roofColor.name}</div>
                      <div className="text-xs text-gray-500">{roofColor.code}</div>
                      <div className="text-xs text-gray-400">{roofColor.hex}</div>
                      {roofColor.munsell && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {roofColor.munsell}
                        </Badge>
                      )}
                      {roofColor.difficulty && (
                        <Badge 
                          variant={roofColor.difficulty === '◆' ? 'destructive' : 'secondary'} 
                          className="text-xs mt-1 ml-1"
                        >
                          {roofColor.difficulty === '◆' ? '高難度' : '出にくい色'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg text-center text-gray-500 text-sm">
                    未選択
                  </div>
                )}
              </div>

              {/* ドアの色 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">ドアの色</h4>
                {doorColor ? (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: doorColor.hex }}
                    />
                    <div>
                      <div className="font-medium text-sm">{doorColor.name}</div>
                      <div className="text-xs text-gray-500">{doorColor.code}</div>
                      <div className="text-xs text-gray-400">{doorColor.hex}</div>
                      {doorColor.munsell && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {doorColor.munsell}
                        </Badge>
                      )}
                      {doorColor.difficulty && (
                        <Badge 
                          variant={doorColor.difficulty === '◆' ? 'destructive' : 'secondary'} 
                          className="text-xs mt-1 ml-1"
                        >
                          {doorColor.difficulty === '◆' ? '高難度' : '出にくい色'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 rounded-lg text-center text-gray-500 text-sm">
                    未選択
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* デバッグ情報 */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>壁色ID:</strong> {wallColorId || '未選択'}
                </div>
                <div>
                  <strong>屋根色ID:</strong> {roofColorId || '未選択'}
                </div>
                <div>
                  <strong>ドア色ID:</strong> {doorColorId || '未選択'}
                </div>
              </div>
              
              {/* JSON出力 */}
              <div className="space-y-2">
                <h4 className="font-semibold">選択データ（JSON形式）：</h4>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{JSON.stringify({
  wall: wallColor ? {
    id: wallColor.id,
    name: wallColor.name,
    code: wallColor.code,
    hex: wallColor.hex,
    rgb: wallColor.rgb,
    munsell: wallColor.munsell,
    difficulty: wallColor.difficulty
  } : null,
  roof: roofColor ? {
    id: roofColor.id,
    name: roofColor.name,
    code: roofColor.code,
    hex: roofColor.hex,
    rgb: roofColor.rgb,
    munsell: roofColor.munsell,
    difficulty: roofColor.difficulty
  } : null,
  door: doorColor ? {
    id: doorColor.id,
    name: doorColor.name,
    code: doorColor.code,
    hex: doorColor.hex,
    rgb: doorColor.rgb,
    munsell: doorColor.munsell,
    difficulty: doorColor.difficulty
  } : null
}, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 機能確認チェックリスト */}
        <Card>
          <CardHeader>
            <CardTitle>✅ テスト確認項目</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="category" />
                <label htmlFor="category">カテゴリ選択が表示される</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="subcategory" />
                <label htmlFor="subcategory">サブカテゴリ選択に進める</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="color" />
                <label htmlFor="color">個別の色を選択できる</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="back" />
                <label htmlFor="back">戻るボタンが機能する</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="reset" />
                <label htmlFor="reset">リセットボタンが機能する</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="display" />
                <label htmlFor="display">選択された色が正しく表示される</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="usage" />
                <label htmlFor="usage">用途別（壁/屋根/ドア）の推奨色が表示される</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="data" />
                <label htmlFor="data">色データ（RGB、日塗工番号、マンセル値）が正しい</label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}