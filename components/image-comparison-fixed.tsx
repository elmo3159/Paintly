'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Maximize2, X } from 'lucide-react'
import { ScreenReaderOnly, AccessibleButton } from '@/components/accessibility-helpers'

// Client-side error reporting function
const reportClientError = (error: Error, context: string) => {
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          component: 'ImageComparisonFixed'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

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
  const [originalImageLoaded, setOriginalImageLoaded] = useState(false)
  const [generatedImageLoaded, setGeneratedImageLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // 画像プリロード戦略: 高優先度プリロードで表示パフォーマンス向上
  useEffect(() => {
    if (!originalImage || !generatedImage) return

    const preloadImages = async () => {
      try {
        console.log('🔄 Starting image preload:', { originalImage, generatedImage })
        setIsLoading(true)

        const promises = [
          new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              console.log('✅ Original image loaded successfully')
              setOriginalImageLoaded(true)
              resolve()
            }
            img.onerror = (event) => {
              const error = new Error(`Failed to load original image: ${originalImage}`)
              console.error('❌ 元画像の読み込みに失敗:', error)
              reportClientError(error, `Original image preload - URL: ${originalImage}`)
              setOriginalImageLoaded(false)
              resolve() // Continue even if image fails to load
            }
            img.src = originalImage
          }),
          new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              console.log('✅ Generated image loaded successfully')
              setGeneratedImageLoaded(true)
              resolve()
            }
            img.onerror = (event) => {
              const error = new Error(`Failed to load generated image: ${generatedImage}`)
              console.error('❌ 生成画像の読み込みに失敗:', error)
              reportClientError(error, `Generated image preload - URL: ${generatedImage}`)
              setGeneratedImageLoaded(false)
              resolve() // Continue even if image fails to load
            }
            img.src = generatedImage
          })
        ]

        await Promise.all(promises)
        console.log('✅ Image preload completed')
        setIsLoading(false)
      } catch (error) {
        const preloadError = error instanceof Error ? error : new Error('Unknown error in image preload')
        console.error('❌ Error in preloadImages:', preloadError)
        reportClientError(preloadError, `Image preload error - Original: ${originalImage}, Generated: ${generatedImage}`)
        setIsLoading(false)
      }
    }

    preloadImages()
  }, [originalImage, generatedImage])

  // デバッグ用：画像URLをログ出力
  console.log('🔥 MOBILE TOUCH FIXED - ImageComparisonFixed:')
  console.log('  📷 originalImage URL (will show on LEFT):', originalImage)
  console.log('  🎨 generatedImage URL (will show on RIGHT):', generatedImage)
  console.log('  🎯 RENDERING LOGIC: Left=originalImage, Right=generatedImage')

  const downloadImage = async (url: string, filename: string) => {
    try {
      console.log('📥 Starting image download:', { url, filename })

      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL for download: ${url}`)
      }

      // Validate filename
      if (!filename || typeof filename !== 'string') {
        throw new Error(`Invalid filename for download: ${filename}`)
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or invalid')
      }

      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      console.log('✅ Image download completed successfully:', filename)
    } catch (error) {
      const downloadError = error instanceof Error ? error : new Error('Unknown download error')
      console.error('❌ Download failed:', downloadError)
      reportClientError(downloadError, `Image download - URL: ${url}, Filename: ${filename}`)

      // Show user-friendly error message
      alert(`画像のダウンロードに失敗しました: ${downloadError.message}`)
    }
  }

  const toggleFullscreen = () => {
    console.log('🔄 Toggling fullscreen mode')
    setIsFullscreen(!isFullscreen)

    // フルスクリーン時はスクロールを無効化
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden'
      console.log('✅ Entered fullscreen mode')
    } else {
      document.body.style.overflow = ''
      console.log('✅ Exited fullscreen mode')
    }
  }

  // フルスクリーン終了時のクリーンアップ
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const updateSliderPosition = useCallback((clientX: number) => {
    try {
      if (!containerRef.current) {
        console.warn('⚠️ Container ref is not available for slider position update')
        return
      }

      // Validate clientX
      if (typeof clientX !== 'number' || isNaN(clientX)) {
        throw new Error(`Invalid clientX value: ${clientX}`)
      }

      const rect = containerRef.current.getBoundingClientRect()

      // Validate rect dimensions
      if (!rect || rect.width === 0) {
        throw new Error('Container has invalid dimensions')
      }

      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))

      // Validate percentage
      if (isNaN(percentage)) {
        throw new Error(`Invalid percentage calculated: ${percentage}`)
      }

      setSliderPosition(percentage)
    } catch (error) {
      const positionError = error instanceof Error ? error : new Error('Unknown error in updateSliderPosition')
      console.error('❌ Error updating slider position:', positionError)
      reportClientError(positionError, `Slider position update - clientX: ${clientX}`)
    }
  }, [])

  // キーボードイベント
  const handleKeyDown = (e: React.KeyboardEvent) => {
    try {
      console.log('⌨️ Keyboard event:', e.key, 'shift:', e.shiftKey)

      const step = e.shiftKey ? 10 : 5 // Shiftキーで大きなステップ

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setSliderPosition(prev => {
            const newPosition = Math.max(0, prev - step)
            console.log('⬅️ Moving slider left:', prev, '->', newPosition)
            return newPosition
          })
          break
        case 'ArrowRight':
          e.preventDefault()
          setSliderPosition(prev => {
            const newPosition = Math.min(100, prev + step)
            console.log('➡️ Moving slider right:', prev, '->', newPosition)
            return newPosition
          })
          break
        case 'Home':
          e.preventDefault()
          setSliderPosition(0)
          console.log('🏠 Slider moved to start (0%)')
          break
        case 'End':
          e.preventDefault()
          setSliderPosition(100)
          console.log('🏁 Slider moved to end (100%)')
          break
        default:
          // No action for other keys
          break
      }
    } catch (error) {
      const keyboardError = error instanceof Error ? error : new Error('Unknown keyboard event error')
      console.error('❌ Error in keyboard event handler:', keyboardError)
      reportClientError(keyboardError, `Keyboard event - Key: ${e.key}, Shift: ${e.shiftKey}`)
    }
  }

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    try {
      console.log('🖱️ Mouse down event:', e.clientX, e.clientY)
      e.preventDefault()
      setIsDragging(true)
      updateSliderPosition(e.clientX)
    } catch (error) {
      const mouseError = error instanceof Error ? error : new Error('Unknown mouse down error')
      console.error('❌ Error in mouse down handler:', mouseError)
      reportClientError(mouseError, `Mouse down event - clientX: ${e.clientX}`)
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    try {
      if (isDragging) {
        e.preventDefault()
        updateSliderPosition(e.clientX)
      }
    } catch (error) {
      const mouseMoveError = error instanceof Error ? error : new Error('Unknown mouse move error')
      console.error('❌ Error in mouse move handler:', mouseMoveError)
      reportClientError(mouseMoveError, `Mouse move event - clientX: ${e.clientX}, isDragging: ${isDragging}`)
    }
  }, [isDragging, updateSliderPosition])

  const handleMouseUp = useCallback(() => {
    try {
      console.log('🖱️ Mouse up event')
      setIsDragging(false)
    } catch (error) {
      const mouseUpError = error instanceof Error ? error : new Error('Unknown mouse up error')
      console.error('❌ Error in mouse up handler:', mouseUpError)
      reportClientError(mouseUpError, 'Mouse up event')
    }
  }, [])

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    try {
      console.log('👆 Touch start event:', e.touches.length, 'touches')
      e.preventDefault()
      setIsDragging(true)

      if (e.touches.length === 0) {
        throw new Error('No touch points available in touch start event')
      }

      const touch = e.touches[0]
      if (!touch) {
        throw new Error('First touch point is undefined')
      }

      console.log('👆 Touch position:', touch.clientX, touch.clientY)
      updateSliderPosition(touch.clientX)
    } catch (error) {
      const touchStartError = error instanceof Error ? error : new Error('Unknown touch start error')
      console.error('❌ Error in touch start handler:', touchStartError)
      reportClientError(touchStartError, `Touch start event - touches: ${e.touches.length}`)
    }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    try {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault()

        if (e.touches.length === 0) {
          throw new Error('No touch points available in touch move event')
        }

        const touch = e.touches[0]
        if (!touch) {
          throw new Error('First touch point is undefined in touch move')
        }

        updateSliderPosition(touch.clientX)
      }
    } catch (error) {
      const touchMoveError = error instanceof Error ? error : new Error('Unknown touch move error')
      console.error('❌ Error in touch move handler:', touchMoveError)
      reportClientError(touchMoveError, `Touch move event - touches: ${e.touches.length}, isDragging: ${isDragging}`)
    }
  }, [isDragging, updateSliderPosition])

  const handleTouchEnd = useCallback(() => {
    try {
      console.log('👆 Touch end event')
      setIsDragging(false)
    } catch (error) {
      const touchEndError = error instanceof Error ? error : new Error('Unknown touch end error')
      console.error('❌ Error in touch end handler:', touchEndError)
      reportClientError(touchEndError, 'Touch end event')
    }
  }, [])

  // ポインターイベント（統合的なアプローチ）
  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      console.log('👉 Pointer down event:', e.pointerId, 'type:', e.pointerType)
      e.preventDefault()
      setIsDragging(true)
      updateSliderPosition(e.clientX)

      // ポインターキャプチャを設定してドラッグ中も確実にイベントを受け取る
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        console.log('✅ Pointer capture set for pointer:', e.pointerId)
      } catch (captureError) {
        console.warn('⚠️ Failed to set pointer capture:', captureError)
        // Continue without pointer capture
      }
    } catch (error) {
      const pointerDownError = error instanceof Error ? error : new Error('Unknown pointer down error')
      console.error('❌ Error in pointer down handler:', pointerDownError)
      reportClientError(pointerDownError, `Pointer down event - pointerId: ${e.pointerId}, type: ${e.pointerType}`)
    }
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    try {
      if (isDragging) {
        e.preventDefault()
        updateSliderPosition(e.clientX)
      }
    } catch (error) {
      const pointerMoveError = error instanceof Error ? error : new Error('Unknown pointer move error')
      console.error('❌ Error in pointer move handler:', pointerMoveError)
      reportClientError(pointerMoveError, `Pointer move event - pointerId: ${e.pointerId}, isDragging: ${isDragging}`)
    }
  }, [isDragging, updateSliderPosition])

  const handlePointerUp = useCallback((e: PointerEvent) => {
    try {
      console.log('👉 Pointer up event:', e.pointerId)
      setIsDragging(false)

      // ポインターキャプチャを解除
      try {
        ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
        console.log('✅ Pointer capture released for pointer:', e.pointerId)
      } catch (releaseError) {
        console.warn('⚠️ Failed to release pointer capture:', releaseError)
        // Continue without pointer capture release
      }
    } catch (error) {
      const pointerUpError = error instanceof Error ? error : new Error('Unknown pointer up error')
      console.error('❌ Error in pointer up handler:', pointerUpError)
      reportClientError(pointerUpError, `Pointer up event - pointerId: ${e.pointerId}`)
    }
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

  // フルスクリーンモーダル表示
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
        {/* 閉じるボタン - 左上 */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 z-[10000] bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="フルスクリーンを閉じる"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="h-6 w-6 text-gray-900" />
        </button>

        {/* スクリーンリーダー用の説明 */}
        <ScreenReaderOnly>
          左上の閉じるボタンをタップしてフルスクリーンを終了できます。スライダーを左右にドラッグして画像を比較してください。
        </ScreenReaderOnly>

        {/* 全画面スライダー */}
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={containerRef}
            className="relative w-full h-full cursor-col-resize select-none"
            style={{ 
              touchAction: 'none',
              userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-label="画像比較スライダー（フルスクリーン）"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPosition}
            aria-valuetext={`比較位置: ${Math.round(sliderPosition)}%`}
            tabIndex={0}
          >
            {/* 生成画像背景（右側） */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${generatedImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center'
              }}
            />

            {/* 元画像（左側・クリップマスク） */}
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
              {/* スライダーハンドル - モバイル最適化（大きめ） */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-col-resize pointer-events-auto z-20 flex items-center justify-center"
                style={{ 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onPointerDown={handlePointerDown}
              >
                <div className="w-1 h-8 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部の説明テキスト */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <p className="text-xs font-medium text-gray-900 text-center">
            左側：元画像 | 右側：生成画像
          </p>
        </div>
      </div>
    )
  }

  // 通常表示
  return (
    <Card 
      id="comparison-container-fixed" 
      className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'bg-white'}
      role="region"
      aria-labelledby="comparison-title"
      aria-describedby="comparison-description"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle id="comparison-title">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title="フルスクリーン"
            aria-label="画像比較をフルスクリーンで表示"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {allowDownload && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(originalImage, 'original.png')}
                aria-label="元画像をダウンロード"
              >
                <Download className="h-4 w-4 mr-2" />
                元画像
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImage(generatedImage, 'generated.png')}
                aria-label="生成画像をダウンロード"
              >
                <Download className="h-4 w-4 mr-2" />
                生成画像
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScreenReaderOnly id="comparison-description">
          左右にドラッグまたは矢印キーで画像を比較できます。左が元画像、右が生成画像です。
        </ScreenReaderOnly>
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg overflow-hidden border-4 border-gray-900 shadow-[4px_4px_0_0_hsl(18,68%,48%)]">
          <div
            ref={containerRef}
            className="relative w-full h-96 cursor-col-resize select-none bg-white"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-label="画像比較スライダー"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPosition}
            aria-valuetext={`比較位置: ${Math.round(sliderPosition)}%`}
            tabIndex={0}
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
        <div className="mt-4 text-center text-sm text-gray-900 space-y-1 bg-white p-4 rounded-lg border-2 border-gray-900">
          <p>スライダーを左右にドラッグして比較してください</p>
          <p className="text-xs font-medium">
            左側：元画像 | 右側：生成画像（アフター）
          </p>
        </div>
      </CardContent>
    </Card>
  )
}