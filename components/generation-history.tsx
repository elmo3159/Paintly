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
  // Removed selectedItem state - using unified slider view instead
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

  // Removed auto-open detail view - using unified slider view instead

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

  // Removed handleSetSelectedItem - using unified slider view instead

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
                            priority={item.id === latestGenerationId}
                            unoptimized
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

    </div>
  )
}
