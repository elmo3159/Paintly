/**
 * 画像比較グリッドコンポーネント
 * 複数の生成画像を2×2または3×3グリッドで比較表示
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Maximize2, Grid2X2, Grid3X3, Download, FileDown, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ComparisonItem {
  id: string
  generated_image_url: string
  original_image_url: string
  wall_color: string | null
  roof_color: string | null
  door_color: string | null
  weather: string | null
  created_at: string
}

interface ImageComparisonGridProps {
  selectedIds: string[]
  customerId: string
}

export function ImageComparisonGrid({ selectedIds, customerId }: ImageComparisonGridProps) {
  const [items, setItems] = useState<ComparisonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [gridMode, setGridMode] = useState<'2x2' | '3x3'>('2x2')
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)
  const supabase = createClient()

  // 選択された画像を取得
  useEffect(() => {
    const fetchItems = async () => {
      if (selectedIds.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('*')
          .in('id', selectedIds)
          .eq('status', 'completed')

        if (error) throw error

        setItems(data || [])
      } catch (error) {
        console.error('Error fetching comparison items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [selectedIds])

  // グリッドレイアウトのクラスを取得
  const getGridClass = () => {
    if (gridMode === '2x2') {
      return 'grid-cols-2 gap-2 md:gap-4'
    }
    return 'grid-cols-2 gap-2 md:grid-cols-3 md:gap-3'
  }

  // 画像ダウンロード
  const downloadImage = async (url: string, filename: string) => {
    try {
      // Next.js API Routeを経由してダウンロード（CORS回避）
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('ダウンロードに失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (selectedIds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            履歴タブから比較したい画像を選択してください
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            （QRコード共有時も、渡したい画像すべてにチェックを入れてください）
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            最大9個まで選択可能（3×3グリッド）
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* コントロールバー */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              選択: {selectedIds.length}個
            </Badge>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={gridMode === '2x2' ? 'default' : 'outline'}
                onClick={() => setGridMode('2x2')}
              >
                <Grid2X2 className="h-4 w-4 mr-1" />
                2×2
              </Button>
              <Button
                size="sm"
                variant={gridMode === '3x3' ? 'default' : 'outline'}
                onClick={() => setGridMode('3x3')}
                className="hidden md:inline-flex"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                3×3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 比較グリッド */}
      <motion.div
        layout
        className={cn('grid', getGridClass())}
      >
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* 画像 */}
                  <div
                    className="relative w-full aspect-square cursor-pointer group"
                    onClick={() => setFullscreenIndex(index)}
                  >
                    <Image
                      src={item.generated_image_url}
                      alt={`比較画像 ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* ホバーオーバーレイ */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white" />
                    </div>
                    {/* インデックス番号 */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  {/* 設定情報 */}
                  <div className="p-3 space-y-1">
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {item.wall_color && item.wall_color !== '変更なし' && (
                        <p>壁: {item.wall_color}</p>
                      )}
                      {item.roof_color && item.roof_color !== '変更なし' && (
                        <p>屋根: {item.roof_color}</p>
                      )}
                      {item.door_color && item.door_color !== '変更なし' && (
                        <p>ドア: {item.door_color}</p>
                      )}
                      {item.weather && (
                        <p>天候: {item.weather}</p>
                      )}
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(item.generated_image_url, `paintly_${item.id}.png`)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        DL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* フルスクリーンモーダル */}
      <AnimatePresence>
        {fullscreenIndex !== null && items[fullscreenIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenIndex(null)}
          >
            <div className="relative w-full h-full max-w-6xl max-h-[90dvh]">
              <Image
                src={items[fullscreenIndex].generated_image_url}
                alt={`フルスクリーン画像 ${fullscreenIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
              {/* 閉じるボタン */}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  setFullscreenIndex(null)
                }}
              >
                閉じる
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
