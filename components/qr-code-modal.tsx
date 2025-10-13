'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, Copy, CheckCircle, Share2, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  customerPageId: string
  onSuccess?: () => void
}

export function QRCodeModal({
  open,
  onOpenChange,
  selectedIds,
  customerPageId,
  onSuccess
}: QRCodeModalProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      setError('画像を選択してください')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generationIds: selectedIds,
          customerPageId,
          expiresInDays: 7
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'QRコードの生成に失敗しました')
      }

      setShareUrl(result.shareUrl)
      setExpiresAt(result.expiresAt)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error generating QR code:', error)
      setError(error.message || 'QRコードの生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      alert('URLのコピーに失敗しました')
    }
  }

  const handleDownloadQR = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    // SVGをPNG画像に変換してダウンロード
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'paintly_qr_code.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleClose = () => {
    setShareUrl(null)
    setExpiresAt(null)
    setError(null)
    setCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            QRコード共有
          </DialogTitle>
          <DialogDescription>
            選択した画像をQRコードで簡単に共有できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              <Alert>
                <AlertDescription>
                  <strong>{selectedIds.length}枚</strong>の画像が選択されています
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>共有リンクの有効期限</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>7日間（作成から1週間後に自動削除）</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || selectedIds.length === 0}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    QRコードを生成
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  QRコードが生成されました！
                </AlertDescription>
              </Alert>

              {/* QRコード表示 */}
              <div
                ref={qrRef}
                className="flex items-center justify-center p-6 bg-white rounded-lg border-2 border-primary"
              >
                <QRCodeSVG
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* URL表示とコピー */}
              <div className="space-y-2">
                <Label htmlFor="share-url">共有URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 有効期限表示 */}
              {expiresAt && (
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  有効期限: {new Date(expiresAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  QRコード保存
                </Button>
                <Button
                  onClick={handleClose}
                  variant="default"
                  className="flex-1"
                >
                  閉じる
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  💡 お客様がこのQRコードをスマートフォンで読み取ると、選択した画像を閲覧・ダウンロードできます
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
