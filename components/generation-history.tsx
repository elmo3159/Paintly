'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Eye, Calendar, Palette } from 'lucide-react'
import Image from 'next/image'

interface GenerationHistoryItem {
  id: string
  created_at: string
  status: 'processing' | 'completed' | 'failed'
  prompt_details: any
  result_image_url: string | null
  original_image_url: string | null
  error_message: string | null
}

interface GenerationHistoryProps {
  customerId: string
}

export function GenerationHistory({ customerId }: GenerationHistoryProps) {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [customerId])

  const fetchHistory = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setHistory(data)
    }
    setLoading(false)
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            まだ生成履歴がありません
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            シミュレーション作成タブから画像を生成してください
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>生成履歴</CardTitle>
          <CardDescription>
            過去に生成したシミュレーション画像
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail */}
                      <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {item.result_image_url ? (
                          <Image
                            src={item.result_image_url}
                            alt="生成画像"
                            fill
                            className="object-cover"
                          />
                        ) : item.status === 'processing' ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-sm text-muted-foreground">
                              画像なし
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <Badge
                            variant={
                              item.status === 'completed' ? 'default' :
                              item.status === 'processing' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {item.status === 'completed' ? '完了' :
                             item.status === 'processing' ? '処理中' :
                             '失敗'}
                          </Badge>
                        </div>

                        {item.prompt_details && (
                          <div className="text-sm space-y-1">
                            {item.prompt_details.wallColor !== '変更なし' && (
                              <p>壁: {item.prompt_details.wallColor}</p>
                            )}
                            {item.prompt_details.roofColor !== '変更なし' && (
                              <p>屋根: {item.prompt_details.roofColor}</p>
                            )}
                            {item.prompt_details.doorColor !== '変更なし' && (
                              <p>ドア: {item.prompt_details.doorColor}</p>
                            )}
                            <p>天候: {item.prompt_details.weather}</p>
                          </div>
                        )}

                        {item.error_message && (
                          <p className="text-sm text-destructive">
                            エラー: {item.error_message}
                          </p>
                        )}

                        {item.status === 'completed' && item.result_image_url && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              詳細
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadImage(
                                item.result_image_url!,
                                `paintly_${item.id}.png`
                              )}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              ダウンロード
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Modal - To be implemented with a proper modal component */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>生成画像詳細</CardTitle>
              <Button
                className="absolute top-4 right-4"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem.result_image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={selectedItem.result_image_url}
                    alt="生成画像"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>生成日時:</strong> {new Date(selectedItem.created_at).toLocaleString('ja-JP')}
                </p>
                <p className="text-sm">
                  <strong>ステータス:</strong> {selectedItem.status === 'completed' ? '完了' : selectedItem.status}
                </p>
                {selectedItem.prompt_details && (
                  <div className="text-sm">
                    <strong>設定内容:</strong>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs">
                      {JSON.stringify(selectedItem.prompt_details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}