'use client'

import { useState } from 'react'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'

interface ImageComparisonProps {
  originalImage: string
  generatedImage: string
  title?: string
  allowDownload?: boolean
}

export function ImageComparison({
  originalImage,
  generatedImage,
  title = 'ビフォーアフター比較',
  allowDownload = true
}: ImageComparisonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      document.getElementById('comparison-container')?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <Card id="comparison-container" className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
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
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          minScale={0.5}
          maxScale={4}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="mb-4 flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => zoomIn()}
                  title="ズームイン"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => zoomOut()}
                  title="ズームアウト"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resetTransform()}
                  title="リセット"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <TransformComponent>
                <div className="relative w-full">
                  <ReactCompareSlider
                    itemOne={
                      <ReactCompareSliderImage
                        src={originalImage}
                        alt="元画像"
                      />
                    }
                    itemTwo={
                      <ReactCompareSliderImage
                        src={generatedImage}
                        alt="生成画像"
                      />
                    }
                    portrait={false}
                    position={50}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          スライダーを左右に動かして比較 • マウスホイールまたはボタンでズーム
        </div>
      </CardContent>
    </Card>
  )
}