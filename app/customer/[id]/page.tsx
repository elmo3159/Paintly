'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/image-upload'
import { CompactColorSelector } from '@/components/compact-color-selector'
import { getColorById, type ColorUsage } from '@/lib/hierarchical-paint-colors'
import { WeatherSelector } from '@/components/weather-selector'
import { GenerationSettings } from '@/components/generation-settings'
import { GenerationHistory } from '@/components/generation-history'
import { ImageComparisonFixed } from '@/components/image-comparison-fixed'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, AlertCircle, Edit, Save, X, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AIProviderSelector, useAIProviderSelector, type ProviderType } from '@/components/ai-provider-selector'
import { EnhancedLoading } from '@/components/enhanced-loading'
import { EnhancedError, useEnhancedError, type ErrorType } from '@/components/enhanced-error'
import { CustomerPageSkeleton } from '@/components/skeleton-loader'

interface CustomerData {
  id?: string
  title: string
  customer_name: string | null
  customer_address: string | null
  customer_phone: string | null
  customer_email: string | null
  description: string | null
}

export default function CustomerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const customerId = params.id as string
  const supabase = createClient()

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { error, errorType, showError, clearError } = useEnhancedError()

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

  // Slider view states
  const [showSliderView, setShowSliderView] = useState(false)
  const [sliderData, setSliderData] = useState<any>(null)

  // Edit form states
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Delete functionality states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // AI Provider selection
  const { 
    selectedProvider: selectedAIProvider, 
    availableProviders, 
    changeProvider, 
    isLoading: providersLoading 
  } = useAIProviderSelector()

  // Edit form states
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_address: '',
    customer_phone: '',
    customer_email: '',
    description: ''
  })

  const [activeTab, setActiveTab] = useState('generation')
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [latestGenerationId, setLatestGenerationId] = useState<string | null>(null)

  // Load customer data
  useEffect(() => {
    loadCustomer()
  }, [customerId])

  // Handle URL parameters for slider view
  useEffect(() => {
    const view = searchParams.get('view')
    const generationId = searchParams.get('generationId')
    
    console.log('🔍 URL Parameters:', { view, generationId })
    
    if (view === 'slider' && generationId) {
      console.log('🔄 Loading slider data for generation:', generationId)
      loadSliderData(generationId)
    }
  }, [searchParams])

  const loadSliderData = async (generationId: string) => {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .single()

      if (error) throw error

      if (data) {
        const sliderData = {
          id: data.id,
          originalImageUrl: data.original_image_url,
          generatedImageUrl: data.generated_image_url,
          wallColor: data.wall_color,
          roofColor: data.roof_color,
          doorColor: data.door_color,
          weather: data.weather,
          otherInstructions: data.other_instructions,
          createdAt: data.created_at
        }
        setSliderData(sliderData)
        setShowSliderView(true)
      }
    } catch (error: any) {
      console.error('Error loading slider data:', error)
      showError('スライダーデータの読み込みに失敗しました', 'api')
    }
  }
  const loadCustomer = async () => {
    if (!customerId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customer_pages')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) throw error
      setCustomer(data)

      // Initialize edit form
      setEditForm({
        customer_name: data.customer_name || '',
        customer_address: data.customer_address || '',
        customer_phone: data.customer_phone || '',
        customer_email: data.customer_email || '',
        description: data.description || ''
      })
    } catch (error: any) {
      console.error('Error loading customer:', error)
      showError(error.message || '顧客データの読み込みに失敗しました', 'api')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEditCustomer = () => {
    setIsEditing(true)
  }

  const handleSaveCustomer = async () => {
    if (!customer) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('customer_pages')
        .update({
          title: customer.title,
          customer_name: editForm.customer_name || null,
          customer_address: editForm.customer_address || null,
          customer_phone: editForm.customer_phone || null,
          customer_email: editForm.customer_email || null,
          description: editForm.description || null
        })
        .eq('id', customer.id)

      if (error) throw error

      // Reload customer data
      await loadCustomer()
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving customer:', error)
      showError(error.message || '顧客情報の保存に失敗しました', 'api')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (customer) {
      setEditForm({
        customer_name: customer.customer_name || '',
        customer_address: customer.customer_address || '',
        customer_phone: customer.customer_phone || '',
        customer_email: customer.customer_email || '',
        description: customer.description || ''
      })
    }
  }

  const handleDeleteCustomer = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!customer) return

    try {
      setDeleting(true)
      
      // Delete all generations for this customer first
      const { error: generationsError } = await supabase
        .from('generations')
        .delete()
        .eq('customer_page_id', customer.id)

      if (generationsError) throw generationsError

      // Delete the customer page
      const { error: customerError } = await supabase
        .from('customer_pages')
        .delete()
        .eq('id', customer.id)

      if (customerError) throw customerError

      // Navigate back to dashboard
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      showError(error.message || '顧客ページの削除に失敗しました', 'api')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const openSliderView = (data: any) => {
    setSliderData(data)
    setShowSliderView(true)
  }

  const closeSliderView = () => {
    setShowSliderView(false)
    setSliderData(null)
  }

  const handleGenerate = async () => {
    if (!mainImage) {
      showError('メイン画像を選択してください', 'validation')
      return
    }

    setGenerating(true)
    clearError()

    try {
      const formData = new FormData()
      formData.append('mainImage', mainImage)
      if (sideImage) formData.append('sideImage', sideImage)
      formData.append('customerId', customerId)
      formData.append('wallColor', wallColorId)
      formData.append('roofColor', roofColorId)
      formData.append('doorColor', doorColorId)
      formData.append('weather', weather)
      formData.append('layoutSideBySide', layoutSideBySide.toString())
      formData.append('backgroundColor', backgroundColor)
      formData.append('otherInstructions', otherInstructions)
      formData.append('aiProvider', selectedAIProvider)

      // Add detailed color data
      const wallColorData = getColorById(wallColorId)
      const roofColorData = getColorById(roofColorId)
      const doorColorData = getColorById(doorColorId)

      if (wallColorData) formData.append('wallColorData', JSON.stringify(wallColorData))
      if (roofColorData) formData.append('roofColorData', JSON.stringify(roofColorData))
      if (doorColorData) formData.append('doorColorData', JSON.stringify(doorColorData))

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      if (result.success && result.historyId) {
        setLatestGenerationId(result.historyId)
        setHistoryRefresh(prev => prev + 1)
        setActiveTab('history')
      } else {
        throw new Error(result.message || 'Unknown error')
      }

    } catch (error: any) {
      console.error('Generation error:', error)
      
      // エラータイプの判定とユーザーフレンドリーなメッセージの表示
      let errorType: ErrorType = 'unknown'
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorType = 'network'
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorType = 'quota'
      } else if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        errorType = 'auth'
      } else if (error.message?.includes('processing') || error.message?.includes('generation')) {
        errorType = 'processing'
      } else if (error.message?.includes('upload') || error.message?.includes('file')) {
        errorType = 'upload'
      }
      
      showError(error.message || '画像生成中にエラーが発生しました', errorType)
    } finally {
      setGenerating(false)
    }
  }

  const handleLoadingComplete = () => {
    setGenerating(false)
  }



  if (loading) {
    return <CustomerPageSkeleton />
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            顧客ページが見つかりません
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={customer.title}
                onChange={(e) => setCustomer(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                className="text-3xl font-bold tracking-tight h-12 text-2xl bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0 focus:border-primary"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    await handleSaveCustomer()
                    setIsEditingTitle(false)
                  }
                }}
                onBlur={async () => {
                  await handleSaveCustomer()
                  setIsEditingTitle(false)
                }}
              />
            ) : (
              <h1
                className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary flex items-center gap-2 justify-center"
                onClick={() => {
                  setIsEditingTitle(true)
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
        </div>
        <p className="text-muted-foreground mt-2 text-center">
          塗装シミュレーションを作成
        </p>
      </div>

      {/* Slider View */}
      {showSliderView && sliderData && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 min-h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">ビフォーアフター比較</h2>
              <Button
                variant="outline"
                onClick={closeSliderView}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                閉じる
              </Button>
            </div>

            <div className="space-y-6">
              <div className="w-full">
                <ImageComparisonFixed
                  originalImage={sliderData.originalImageUrl}
                  generatedImage={sliderData.generatedImageUrl}
                  title="スライダーで比較"
                  allowDownload={true}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>生成設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sliderData.wallColor && sliderData.wallColor !== '変更なし' && (
                    <p><strong>壁の色:</strong> {sliderData.wallColor}</p>
                  )}
                  {sliderData.roofColor && sliderData.roofColor !== '変更なし' && (
                    <p><strong>屋根の色:</strong> {sliderData.roofColor}</p>
                  )}
                  {sliderData.doorColor && sliderData.doorColor !== '変更なし' && (
                    <p><strong>ドアの色:</strong> {sliderData.doorColor}</p>
                  )}
                  {sliderData.weather && sliderData.weather !== '変更なし' && (
                    <p><strong>天候:</strong> {sliderData.weather}</p>
                  )}
                  {sliderData.otherInstructions && (
                    <p><strong>その他の指定:</strong> {sliderData.otherInstructions}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generation">画像生成</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
            <TabsTrigger value="info">顧客情報</TabsTrigger>
          </TabsList>

          {/* Generation Tab */}
          <TabsContent value="generation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      画像アップロード
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUpload
                      onChange={setMainImage}
                      label="建物の正面写真"
                      required
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AIプロバイダー選択</CardTitle>
                    <CardDescription>
                      画像生成に使用するAIプロバイダーを選択してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {providersLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        プロバイダー読み込み中...
                      </div>
                    ) : (
                      <AIProviderSelector
                        selectedProvider={selectedAIProvider}
                        onProviderChange={changeProvider}
                        availableProviders={availableProviders}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>カラー選択</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CompactColorSelector
                      label="壁の色"
                      selectedColorId={wallColorId}
                      onColorSelect={setWallColorId}
                      usage="wall"
                    />
                    <CompactColorSelector
                      label="屋根の色"
                      selectedColorId={roofColorId}
                      onColorSelect={setRoofColorId}
                      usage="roof"
                    />
                    <CompactColorSelector
                      label="ドアの色"
                      selectedColorId={doorColorId}
                      onColorSelect={setDoorColorId}
                      usage="door"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
<WeatherSelector value={weather} onChange={setWeather} />

                <GenerationSettings
                  layoutSideBySide={layoutSideBySide}
                  onLayoutSideBySideChange={setLayoutSideBySide}
                  backgroundColor={backgroundColor}
                  onBackgroundColorChange={setBackgroundColor}
                  sideImage={sideImage}
                  onSideImageChange={setSideImage}
                  otherInstructions={otherInstructions}
                  onOtherInstructionsChange={setOtherInstructions}
                />

                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleGenerate}
                      disabled={generating || !mainImage}
                      className="w-full"
                      size="lg"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          画像生成
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <EnhancedError
                  error={error}
                  errorType={errorType}
                  onRetry={handleGenerate}
                  onDismiss={clearError}
                  showDetails={true}
                />
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <GenerationHistory
              customerId={customerId}
              onSliderView={openSliderView}
              refreshTrigger={historyRefresh}
              latestGenerationId={latestGenerationId}
            />
          </TabsContent>

          {/* Customer Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>顧客情報</CardTitle>
                  <CardDescription>
                    顧客の詳細情報を管理
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveCustomer}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        保存
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        キャンセル
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleEditCustomer} size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </Button>
                      <Button 
                        onClick={handleDeleteCustomer} 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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

      {/* Enhanced Loading Component */}
      <EnhancedLoading
        isVisible={generating}
        provider={selectedAIProvider}
        onComplete={handleLoadingComplete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>顧客ページを削除</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。顧客ページ「{customer?.title}」とすべての生成履歴が完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  削除中...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}