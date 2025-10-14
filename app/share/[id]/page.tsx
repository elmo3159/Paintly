'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, AlertCircle, Calendar, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SharedImageData {
  id: string
  imageUrls: string[] // 署名付きURLの配列
  expires_at: string
  access_count: number
  created_at: string
}

export default function SharePage() {
  const params = useParams()
  const shareId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sharedData, setSharedData] = useState<SharedImageData | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadSharedImage()
  }, [shareId])

  const loadSharedImage = async () => {
    try {
      setLoading(true)

      // APIエンドポイントから署名付きURLを取得
      const response = await fetch(`/api/share/${shareId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || '共有リンクの読み込みに失敗しました')
        return
      }

      const data: SharedImageData = await response.json()
      setSharedData(data)

    } catch (error) {
      console.error('Unexpected error loading shared image:', error)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `paintly_shared_${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
      alert('ダウンロードに失敗しました')
    }
  }

  const downloadAllImages = async () => {
    if (!sharedData || sharedData.imageUrls.length === 0) return

    setDownloading(true)
    try {
      for (let i = 0; i < sharedData.imageUrls.length; i++) {
        await downloadImage(sharedData.imageUrls[i], i)
        
        // ダウンロード間に少し遅延を入れる
        if (i < sharedData.imageUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      console.error('Error downloading images:', error)
      alert('画像のダウンロードに失敗しました')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              エラー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Link href="/">
              <Button className="w-full" variant="outline">
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sharedData) {
    return null
  }

  const expiresAt = new Date(sharedData.expires_at)
  const createdAt = new Date(sharedData.created_at)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">
              塗装シミュレーション画像
            </CardTitle>
            <CardDescription className="mt-2">
              Paintlyで作成された画像が共有されました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>作成日: {createdAt.toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>閲覧数: {sharedData.access_count}回</span>
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                この共有リンクは {expiresAt.toLocaleDateString('ja-JP')} まで有効です
              </AlertDescription>
            </Alert>
            <Button
              onClick={downloadAllImages}
              disabled={downloading}
              className="w-full"
              size="lg"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ダウンロード中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  すべての画像をダウンロード ({sharedData.imageUrls.length}枚)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 画像ギャラリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sharedData.imageUrls.map((url, index) => (
            <Card key={index} className="overflow-hidden bg-white dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-3">
                  <Image
                    src={url}
                    alt={`塗装シミュレーション ${index + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                    priority={index < 2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    画像 {index + 1} / {sharedData.imageUrls.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(url, index)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    DL
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* フッター */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Paintlyは塗装会社向けのAIシミュレーションツールです
            </p>
            <Link href="/">
              <Button variant="outline">
                Paintlyについて詳しく見る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
