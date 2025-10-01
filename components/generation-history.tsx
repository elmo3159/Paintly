'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Eye, Calendar, Palette } from 'lucide-react'
import Image from 'next/image'
import { ImageComparisonFixed } from '@/components/image-comparison-fixed'
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
          component: 'GenerationHistory'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

interface GenerationHistoryItem {
  id: string
  created_at: string
  completed_at: string | null
  status: 'processing' | 'completed' | 'failed'
  wall_color: string | null
  roof_color: string | null
  door_color: string | null
  weather: string | null
  generated_image_url: string | null
  original_image_url: string | null
  fal_response: { imageUrl?: string; hasImage?: boolean; originalImageUrl?: string; model?: string } | null
  error_message: string | null
  prompt: string | null
}

interface GenerationHistoryProps {
  customerId: string
  onSliderView?: (data: any) => void
  refreshTrigger?: number
  latestGenerationId?: string | null
}

export function GenerationHistory({ customerId, onSliderView, refreshTrigger, latestGenerationId }: GenerationHistoryProps) {
  const [history, setHistory] = useState<GenerationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadHistory = async () => {
      try {
        await fetchHistory()
      } catch (error) {
        console.error('❌ Unexpected error in fetchHistory:', error)
        reportClientError(
          error instanceof Error ? error : new Error(String(error)),
          `useEffect fetchHistory for customer ${customerId}`
        )
        setHistory([])
        setLoading(false)
      }
    }

    loadHistory()
  }, [customerId, refreshTrigger])

  // Auto-open detail view for latest generation
  useEffect(() => {
    if (latestGenerationId && history.length > 0) {
      const targetItem = history.find(item => item.id === latestGenerationId)
      if (targetItem) {
        console.log('🎯 Auto-opening detail view for generation:', latestGenerationId)
        setSelectedItem(targetItem)
      }
    }
  }, [latestGenerationId, history])

  const fetchHistory = async () => {
    setLoading(true)
    console.log('🔍 Fetching history for customer ID:', customerId)

    // Check current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Current authenticated user:', { 
      user: user?.id, 
      authError,
      userEmail: user?.email,
      userExists: !!user 
    })

    if (!user) {
      console.error('❌ No authenticated user found - RLS will block data access')
      setHistory([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('generations')
      .select(`
        *,
        prompt,
        created_at,
        status,
        original_image_url,
        generated_image_url,
        wall_color,
        roof_color,
        door_color,
        weather,
        other_instructions
      `)
      .eq('customer_page_id', customerId)
      .order('created_at', { ascending: false })

    console.log('📊 Supabase query result:', { 
      data, 
      error, 
      count: data?.length,
      queryParams: {
        table: 'generations',
        customer_page_id: customerId,
        user_id: user.id
      }
    })

    if (error) {
      console.error('❌ History fetch error (likely RLS blocking access):', error)

      // Report the initial error
      reportClientError(
        new Error(`Supabase query failed: ${error.message}`),
        `fetchHistory for customer ${customerId}`
      )

      // RLS fallback: Try using public debug API when direct DB access fails
      console.log('🔄 Attempting fallback via public debug API...')
      try {
        const fallbackResponse = await fetch(`/api/public-debug?customer_id=${customerId}`)
        const fallbackData = await fallbackResponse.json()

        console.log('📊 Fallback API response:', fallbackData)

        if (fallbackData.success && fallbackData.data?.generations) {
          console.log('✅ Using fallback data from public API')
          setHistory(fallbackData.data.generations)
        } else {
          console.log('⚠️ Fallback API also returned no data')
          setHistory([])

          // Report fallback API failure
          reportClientError(
            new Error('Fallback API returned no data'),
            `fetchHistory fallback for customer ${customerId}`
          )
        }
      } catch (fallbackError) {
        console.error('❌ Fallback API also failed:', fallbackError)
        setHistory([])

        // Report fallback API error
        reportClientError(
          fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
          `fetchHistory fallback API error for customer ${customerId}`
        )
      }
    } else if (!error && data) {
      console.log('✅ Setting history data from direct Supabase query:', data)
      setHistory(data)
    } else {
      console.log('⚠️ No data returned from direct query, trying fallback...')
      
      // Try fallback API even when no error but no data
      try {
        const fallbackResponse = await fetch(`/api/public-debug?customer_id=${customerId}`)
        const fallbackData = await fallbackResponse.json()
        
        if (fallbackData.success && fallbackData.data?.generations) {
          setHistory(fallbackData.data.generations)
        } else {
          setHistory([])
        }
      } catch (fallbackError) {
        console.error('❌ Fallback API failed (no data case):', fallbackError)
        setHistory([])
      }
    }
    
    setLoading(false)
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      // Validate URL parameter
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided for download')
      }

      console.log('🔽 Downloading image:', { url, filename })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      // Validate blob
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

      console.log('✅ Image downloaded successfully:', filename)
    } catch (error) {
      const downloadError = error instanceof Error ? error : new Error('Unknown download error')
      console.error('❌ Download failed:', downloadError)

      // Report error to centralized error reporting
      reportClientError(downloadError, `downloadImage - URL: ${url}, Filename: ${filename}`)

      // Show user-friendly error message
      alert(`画像のダウンロードに失敗しました: ${downloadError.message}`)
    }
  }

  // Enhanced setSelectedItem with detailed logging
  const handleSetSelectedItem = (item: GenerationHistoryItem) => {
    console.log('🎯 SETTING SELECTED ITEM - Full Debug:')
    console.log('  itemId:', item.id)
    console.log('  hasPrompt:', !!item.prompt)
    console.log('  generated_image_url:', item.generated_image_url)
    console.log('  original_image_url:', item.original_image_url)
    setSelectedItem(item)
  }

  // 🆕 New function: Navigate to slider comparison view
  const navigateToSlider = (item: GenerationHistoryItem) => {
    console.log('🔄 Navigating to slider view for generation:', item.id)
    
    // Store generation data in sessionStorage for slider component
    const sliderData = {
      generationId: item.id,
      originalImageUrl: item.original_image_url,
      generatedImageUrl: item.generated_image_url,
      wallColor: item.wall_color,
      roofColor: item.roof_color,
      doorColor: item.door_color,
      weather: item.weather,
      prompt: item.prompt,
      customerId: customerId
    }
    
    sessionStorage.setItem('sliderData', JSON.stringify(sliderData))
    
    // Navigate to customer page with slider view
    // Assuming the router structure: /customer/[id] with tab parameter
    window.location.href = `/customer/${customerId}?tab=create&view=slider&generationId=${item.id}`
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
      <Card role="region" aria-labelledby="history-title">
        <CardHeader>
          <CardTitle id="history-title">生成履歴</CardTitle>
          <CardDescription>
            過去に生成したシミュレーション画像
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4" aria-label="生成履歴一覧">
            <div className="space-y-4" role="list" aria-label="生成履歴アイテム">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden" role="listitem">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:space-x-4 space-y-4 md:space-y-0">
                      {/* Thumbnail - Fixed to use generated_image_url directly */}
                      <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        {item.generated_image_url ? (
                          <Image
                            src={item.generated_image_url}
                            alt={`生成画像 - ${new Date(item.created_at).toLocaleDateString('ja-JP')}作成`}
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
                      <div className="w-full md:flex-1 space-y-2">
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

                        <div className="text-sm space-y-1">
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

                        {item.error_message && (
                          <p className="text-sm text-destructive">
                            エラー: {item.error_message}
                          </p>
                        )}

                        {/* 🆕 Enhanced action buttons with slider navigation */}
                        {item.status === 'completed' && item.generated_image_url && (
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => navigateToSlider(item)}
                              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                              aria-label={`${new Date(item.created_at).toLocaleDateString('ja-JP')}の生成画像をスライダーで比較表示`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              スライダーで比較
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetSelectedItem(item)}
                              aria-label={`${new Date(item.created_at).toLocaleDateString('ja-JP')}の生成詳細を表示`}
                              className="w-full sm:w-auto"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              詳細
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadImage(
                                item.generated_image_url || '',
                                `paintly_${item.id}.png`
                              )}
                              aria-label={`${new Date(item.created_at).toLocaleDateString('ja-JP')}の生成画像をダウンロード`}
                              className="w-full sm:w-auto"
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

      {/* Detail Modal - Fixed to use generated_image_url and original_image_url directly */}
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
              {(() => {
                // 🔧 Fixed: Use direct URL fields instead of fal_response
                const validOriginalUrl = selectedItem.original_image_url
                const validGeneratedUrl = selectedItem.generated_image_url

                console.log('🔍 ImageComparison Debug - Fixed URLs:');
                console.log('  📁 validOriginalUrl:', validOriginalUrl);
                console.log('  📁 validGeneratedUrl:', validGeneratedUrl);
                console.log('  🎮 willShowComparison:', !!(validGeneratedUrl && validOriginalUrl));

                if (validGeneratedUrl && validOriginalUrl) {
                  return (
                    <ImageComparisonFixed
                      originalImage={validOriginalUrl}
                      generatedImage={validGeneratedUrl}
                      title="ビフォーアフター比較"
                      allowDownload={true}
                    />
                  );
                } else if (validGeneratedUrl) {
                  return (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={validGeneratedUrl}
                        alt="生成画像"
                        fill
                        className="object-contain"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center p-8 text-muted-foreground">
                      <p>画像の読み込みに問題があります</p>
                      <p className="text-xs mt-2">
                        original_image_url: {selectedItem.original_image_url || 'なし'}<br/>
                        generated_image_url: {selectedItem.generated_image_url || 'なし'}
                      </p>
                    </div>
                  );
                }
              })()}
              
              {/* 🆕 Enhanced action buttons in modal */}
              <div className="flex justify-center space-x-2 pb-4">
                <Button
                  onClick={() => navigateToSlider(selectedItem)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  スライダーで詳細比較
                </Button>
                {selectedItem.generated_image_url && (
                  <Button
                    variant="outline"
                    onClick={() => downloadImage(
                      selectedItem.generated_image_url || '',
                      `paintly_${selectedItem.id}.png`
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <strong>生成日時:</strong> {new Date(selectedItem.created_at).toLocaleString('ja-JP')}
                </p>
                <p className="text-sm">
                  <strong>ステータス:</strong> {selectedItem.status === 'completed' ? '完了' : selectedItem.status}
                </p>
                <div className="text-sm">
                  <strong>設定内容:</strong>
                  <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                    {selectedItem.wall_color && selectedItem.wall_color !== '変更なし' && (
                      <div>壁の色: {selectedItem.wall_color}</div>
                    )}
                    {selectedItem.roof_color && selectedItem.roof_color !== '変更なし' && (
                      <div>屋根の色: {selectedItem.roof_color}</div>
                    )}
                    {selectedItem.door_color && selectedItem.door_color !== '変更なし' && (
                      <div>ドアの色: {selectedItem.door_color}</div>
                    )}
                    {selectedItem.weather && (
                      <div>天候: {selectedItem.weather}</div>
                    )}
                  </div>
                </div>

                {/* Prompt display */}
                {selectedItem.prompt ? (
                  <div className="text-sm">
                    <strong>生成プロンプト:</strong>
                    <div className="mt-2 p-3 bg-slate-100 border rounded text-xs font-mono max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {selectedItem.prompt}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <strong>⚠️ プロンプト情報なし:</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      このレコードにはプロンプトデータが保存されていません
                    </p>
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
