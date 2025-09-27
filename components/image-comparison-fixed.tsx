'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Maximize2 } from 'lucide-react'

interface ImageComparisonFixedProps {
  originalImage: string
  generatedImage: string
  title?: string
  allowDownload?: boolean
}

export function ImageComparisonFixed({
  originalImage,
  generatedImage,
  title = 'ビフォーアフター比較',
  allowDownload = true
}: ImageComparisonFixedProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // デバッグ用：画像URLをログ出力
  console.log('🔥 MOBILE TOUCH FIXED - ImageComparisonFixed:')
  console.log('  📷 originalImage URL (will show on LEFT):', originalImage)
  console.log('  🎨 generatedImage URL (will show on RIGHT):', generatedImage)
  console.log('  🎯 RENDERING LOGIC: Left=originalImage, Right=generatedImage')

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('comparison-container-fixed')?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const updateSliderPosition = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
      setSliderPosition(percentage)
    }
  }, [])

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      updateSliderPosition(e.clientX)
    }
  }, [isDragging, updateSliderPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    updateSliderPosition(touch.clientX)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      e.preventDefault()
      const touch = e.touches[0]
      updateSliderPosition(touch.clientX)
    }
  }, [isDragging, updateSliderPosition])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ポインターイベント（統合的なアプローチ）
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
    // ポインターキャプチャを設定してドラッグ中も確実にイベントを受け取る
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (isDragging) {
      e.preventDefault()
      updateSliderPosition(e.clientX)
    }
  }, [isDragging, updateSliderPosition])

  const handlePointerUp = useCallback((e: PointerEvent) => {
    setIsDragging(false)
    // ポインターキャプチャを解除
    ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
  }, [])

  // グローバルイベントリスナー
  useEffect(() => {
    if (isDragging) {
      // マウスイベント
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      
      // タッチイベント
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      // ポインターイベント
      document.addEventListener('pointermove', handlePointerMove, { passive: false })
      document.addEventListener('pointerup', handlePointerUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handlePointerMove, handlePointerUp])

  // 画像が存在しない場合のフォールバック表示
  if (!originalImage || !generatedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <p>比較する画像が不足しています</p>
            <p className="text-sm mt-2">
              元画像: {originalImage ? '✓' : '✗'} |
              生成画像: {generatedImage ? '✓' : '✗'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="comparison-container-fixed" className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title="フルスクリーン"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {allowDownload && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(originalImage, 'original.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                元画像
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(generatedImage, 'generated.png')}
              >
                <Download className="h-4 w-4 mr-2" />
                生成画像
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-96 cursor-col-resize select-none bg-gray-200"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onPointerDown={handlePointerDown}
            style={{ 
              userSelect: 'none',
              touchAction: 'none' // スクロールやピンチを防ぐ
            }}
          >
            {/* 🔄 FIXED: 背景全体を元画像（右側表示）に変更 */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${generatedImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center'
              }}
            />

            {/* 🔄 FIXED: クリップマスクを生成画像（左側表示）に変更 */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${originalImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
              }}
            />

            {/* スライダーライン */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* スライダーハンドル - モバイル対応で大きく */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-col-resize pointer-events-auto z-20 flex items-center justify-center"
                style={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  touchAction: 'none' // タッチでのスクロールを防ぐ
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onPointerDown={handlePointerDown}
              >
                <div className="w-1 h-6 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
          <p>スライダーを左右にドラッグして比較してください</p>
          <p className="text-xs font-medium">
            左側：元画像 | 右側：生成画像（アフター）
          </p>
        </div>
      </CardContent>
    </Card>
  )
}