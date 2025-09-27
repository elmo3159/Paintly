'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/image-upload'
import { CompactColorSelector } from '@/components/compact-color-selector'
import { getColorById, type ColorUsage } from '@/lib/hierarchical-paint-colors'
import { WeatherSelector } from '@/components/weather-selector'
import { GenerationSettings } from '@/components/generation-settings'
import { GenerationHistory } from '@/components/generation-history'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, AlertCircle, Edit, Save, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'


interface CustomerData {
  id: string
  title: string
  customer_name: string | null
  customer_address: string | null
  customer_phone: string | null
  customer_email: string | null
  description: string | null
}

export default function CustomerPage() {
  const params = useParams()
  const customerId = params.id as string
  const supabase = createClient()

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [sideImage, setSideImage] = useState<File | null>(null)
  const [wallColorId, setWallColorId] = useState<string>('no-change')
  const [roofColorId, setRoofColorId] = useState<string>('no-change')
  const [doorColorId, setDoorColorId] = useState<string>('no-change')
  const [weather, setWeather] = useState('変更なし')
  const [layoutSideBySide, setLayoutSideBySide] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('白')
  const [otherInstructions, setOtherInstructions] = useState('')

  // Tab and auto-navigation states
  const [activeTab, setActiveTab] = useState('generate')
  const [latestGenerationId, setLatestGenerationId] = useState<string | null>(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)

  // Usage limit
  const [canGenerate, setCanGenerate] = useState(true)
  const [remainingGenerations, setRemainingGenerations] = useState(0)

  // Customer info editing states
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomer()
    checkUsageLimit()
  }, [customerId])

  // Initialize edit form when customer data changes
  useEffect(() => {
    if (customer) {
      setEditForm({
        title: customer.title || '',
        customer_name: customer.customer_name || '',
        customer_address: customer.customer_address || '',
        customer_phone: customer.customer_phone || '',
        customer_email: customer.customer_email || '',
        description: customer.description || ''
      })
    }
  }, [customer])

  // タイトル編集開始時に全選択
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      const input = titleInputRef.current
      
      // より確実な全選択実装
      const selectAll = () => {
        input.focus()
        input.setSelectionRange(0, input.value.length)
      }
      
      // 即座に実行
      selectAll()
      
      // requestAnimationFrameで確実にDOMレンダリング後に実行
      requestAnimationFrame(() => {
        selectAll()
        // さらに確実にするため追加のタイマー
        setTimeout(selectAll, 10)
        setTimeout(selectAll, 100)
      })
    }
  }, [isEditingTitle])

  const fetchCustomer = async () => {
    console.log('🔍 fetchCustomer: 開始', { customerId })
    
    // 認証状態を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 fetchCustomer: 認証状態', { user: user?.id, authError })
    
    const { data, error } = await supabase
      .from('customer_pages')
      .select('*')
      .eq('id', customerId)
      .single()

    console.log('📊 fetchCustomer: データベース結果', { data, error })

    if (error) {
      console.error('❌ fetchCustomer: エラー詳細', error)
      setError(`顧客情報の取得に失敗しました: ${error.message}`)
      setLoading(false)
      return
    }

    console.log('✅ fetchCustomer: 成功', data)
    setCustomer(data)
    setLoading(false)
  }

  const checkUsageLimit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('subscriptions')
      .select(`
        generation_count,
        plans (
          generation_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (data && data.plans) {
      const limit = (data.plans as any).generation_limit
      const used = data.generation_count
      const remaining = limit - used
      setRemainingGenerations(remaining)
      setCanGenerate(remaining > 0)
    }
  }

  const handleEditCustomer = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (customer) {
      setEditForm({
        title: customer.title || '',
        customer_name: customer.customer_name || '',
        customer_address: customer.customer_address || '',
        customer_phone: customer.customer_phone || '',
        customer_email: customer.customer_email || '',
        description: customer.description || ''
      })
    }
  }

  const handleSaveCustomer = async () => {
    setSaving(true)
    setError(null)

    try {
      // API経由でサービスロールを使用
      const response = await fetch(`/api/customer/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title || null,
          customer_name: editForm.customer_name || null,
          customer_address: editForm.customer_address || null,
          customer_phone: editForm.customer_phone || null,
          customer_email: editForm.customer_email || null,
          description: editForm.description || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Customer update failed:', result)
        throw new Error(result.error || 'Update failed')
      }

      console.log('✅ Customer update successful via API')

      // Update local customer state
      setCustomer(prev => prev ? {
        ...prev,
        title: editForm.title || prev.title,
        customer_name: editForm.customer_name || null,
        customer_address: editForm.customer_address || null,
        customer_phone: editForm.customer_phone || null,
        customer_email: editForm.customer_email || null,
        description: editForm.description || null
      } : null)

      setIsEditing(false)

      // サイドバー更新のためのカスタムイベントを発火
      window.dispatchEvent(new CustomEvent('customerUpdated', {
        detail: {
          customerId: customerId,
          newTitle: editForm.title
        }
      }))

    } catch (error: any) {
      console.error('❌ Customer update failed:', error)
      setError(`顧客情報の更新に失敗しました: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleFormChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerate = async () => {
    if (!mainImage) {
      setError('建物の正面写真をアップロードしてください')
      return
    }

    if (!canGenerate) {
      setError('生成回数の上限に達しました。プランをアップグレードしてください。')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('mainImage', mainImage)
      if (sideImage) formData.append('sideImage', sideImage)
      formData.append('customerId', customerId)
      // Get color details from IDs
      console.log('🎨 Color IDs Debug:', { wallColorId, roofColorId, doorColorId })
      const wallColor = wallColorId ? getColorById(wallColorId) : null
      const roofColor = roofColorId ? getColorById(roofColorId) : null
      const doorColor = doorColorId ? getColorById(doorColorId) : null
      console.log('🎨 Color Objects Debug:', { wallColor, roofColor, doorColor })
      
      // Send color information to API
      formData.append('wallColor', wallColor ? `${wallColor.name} (${wallColor.code})` : '変更なし')
      formData.append('roofColor', roofColor ? `${roofColor.name} (${roofColor.code})` : '変更なし')
      formData.append('doorColor', doorColor ? `${doorColor.name} (${doorColor.code})` : '変更なし')
      
      // Send detailed color data for advanced prompts
      if (wallColor) {
        formData.append('wallColorData', JSON.stringify({
          name: wallColor.name,
          code: wallColor.code,
          hex: wallColor.hex,
          rgb: wallColor.rgb,
          munsell: wallColor.munsell
        }))
      }
      if (roofColor) {
        formData.append('roofColorData', JSON.stringify({
          name: roofColor.name,
          code: roofColor.code,
          hex: roofColor.hex,
          rgb: roofColor.rgb,
          munsell: roofColor.munsell
        }))
      }
      if (doorColor) {
        formData.append('doorColorData', JSON.stringify({
          name: doorColor.name,
          code: doorColor.code,
          hex: doorColor.hex,
          rgb: doorColor.rgb,
          munsell: doorColor.munsell
        }))
      }
      formData.append('weather', weather)
      formData.append('layoutSideBySide', layoutSideBySide.toString())
      formData.append('backgroundColor', backgroundColor)
      formData.append('otherInstructions', otherInstructions)

      // Call generation API
      console.log('🚀 Starting generation API call...')
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      console.log('📊 Generation API response:', { success: response.ok, result })
      console.log('🔍 Raw result object:', result)
      console.log('🔍 Result keys:', Object.keys(result))
      console.log('🔍 HistoryId value:', result.historyId)
      console.log('🔍 Result type:', typeof result)

      if (!response.ok) {
        throw new Error(result.error || '生成に失敗しました')
      }

      // Refresh usage limit
      await checkUsageLimit()

      // Show success message and automatically navigate to history tab with detail view
      console.log('✅ Generation successful, initiating auto-navigation...')
      console.log('🎯 Setting latest generation ID:', result.historyId)
      
      setError(null)
      setLatestGenerationId(result.historyId)
      
      console.log('🔄 Switching to history tab...')
      setActiveTab('history')
      
      console.log('♻️ Refreshing history data...')
      setHistoryRefresh(prev => prev + 1)
      
      console.log('🏁 Auto-navigation setup complete')
      
    } catch (error: any) {
      console.error('❌ Generation failed:', error)
      setError(error.message || '生成中にエラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>顧客情報が見つかりません</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                ref={titleInputRef}
                value={editForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="text-3xl font-bold tracking-tight h-12 text-2xl bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 focus:border-primary"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    // Enterキー押下時にもカスタムイベントを発火
                    await handleSaveCustomer()
                    setIsEditingTitle(false)
                  }
                }}
                onBlur={async () => {
                  // タイトルのインライン編集時にもカスタムイベントを発火
                  await handleSaveCustomer()
                  setIsEditingTitle(false)
                }}
              />
            </div>
          ) : (
            <h1
              className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary flex items-center gap-2"
              onClick={() => {
                setIsEditingTitle(true)
                // 直接選択も行う
                setTimeout(() => {
                  if (titleInputRef.current) {
                    titleInputRef.current.focus()
                    titleInputRef.current.select()
                  }
                }, 0)
              }}
            >
              {customer.title}
              <Edit className="h-4 w-4 opacity-50" />
            </h1>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          塗装シミュレーションを作成
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">シミュレーション作成</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
          <TabsTrigger value="info">顧客情報</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Usage Alert */}
          {remainingGenerations <= 3 && remainingGenerations > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                残り生成回数: {remainingGenerations}回
              </AlertDescription>
            </Alert>
          )}

          {!canGenerate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                生成回数の上限に達しました。
                <a href="/billing" className="underline ml-1">
                  プランをアップグレード
                </a>
                してください。
              </AlertDescription>
            </Alert>
          )}

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>建物の写真</CardTitle>
              <CardDescription>
                シミュレーションする建物の写真をアップロードしてください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                label="建物の正面写真（必須）"
                onChange={setMainImage}
                required
              />
            </CardContent>
          </Card>

          {/* Color Selection */}
          <Card>
            <CardHeader>
              <CardTitle>色の選択</CardTitle>
              <CardDescription>
                変更したい部分の色を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompactColorSelector
                usage="wall"
                label="壁の色"
                selectedColorId={wallColorId}
                onColorSelect={setWallColorId}
              />
              <CompactColorSelector
                usage="roof"
                label="屋根の色"
                selectedColorId={roofColorId}
                onColorSelect={setRoofColorId}
              />
              <CompactColorSelector
                usage="door"
                label="ドアの色"
                selectedColorId={doorColorId}
                onColorSelect={setDoorColorId}
              />
            </CardContent>
          </Card>

          {/* Weather and Options */}
          <Card>
            <CardHeader>
              <CardTitle>追加オプション</CardTitle>
              <CardDescription>
                シミュレーションの詳細設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WeatherSelector
                value={weather}
                onChange={setWeather}
              />
              <GenerationSettings
                layoutSideBySide={layoutSideBySide}
                setLayoutSideBySide={setLayoutSideBySide}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                sideImage={sideImage}
                setSideImage={setSideImage}
              />

              <div className="space-y-2">
                <Label htmlFor="other">その他の指定</Label>
                <Textarea
                  id="other"
                  placeholder="その他の要望があれば入力してください（例：庭の雰囲気を明るく）"
                  value={otherInstructions}
                  onChange={(e) => setOtherInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !canGenerate || !mainImage}
            size="lg"
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                シミュレーション生成
              </>
            )}
          </Button>
        </TabsContent>        <TabsContent value="history">
          <GenerationHistory 
            customerId={customerId} 
            refresh={historyRefresh}
            autoOpenDetailId={latestGenerationId}
          />
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>顧客情報</CardTitle>
                <CardDescription>
                  この顧客の詳細情報
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-1" />
                      キャンセル
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveCustomer}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCustomer}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="タイトルを入力"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.title}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customer_name">顧客名</Label>
                {isEditing ? (
                  <Input
                    id="customer_name"
                    value={editForm.customer_name}
                    onChange={(e) => handleFormChange('customer_name', e.target.value)}
                    placeholder="顧客名を入力"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.customer_name || '未入力'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_address">住所</Label>
                {isEditing ? (
                  <Input
                    id="customer_address"
                    value={editForm.customer_address}
                    onChange={(e) => handleFormChange('customer_address', e.target.value)}
                    placeholder="住所を入力"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.customer_address || '未入力'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_phone">電話番号</Label>
                {isEditing ? (
                  <Input
                    id="customer_phone"
                    value={editForm.customer_phone}
                    onChange={(e) => handleFormChange('customer_phone', e.target.value)}
                    placeholder="電話番号を入力"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.customer_phone || '未入力'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customer_email">メールアドレス</Label>
                {isEditing ? (
                  <Input
                    id="customer_email"
                    type="email"
                    value={editForm.customer_email}
                    onChange={(e) => handleFormChange('customer_email', e.target.value)}
                    placeholder="メールアドレスを入力"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.customer_email || '未入力'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">メモ</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="メモを入力"
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {customer.description || '未入力'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}