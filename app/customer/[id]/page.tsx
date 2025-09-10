'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/image-upload'
import { ColorSelector } from '@/components/color-selector'
import { WeatherSelector } from '@/components/weather-selector'
import { GenerationSettings } from '@/components/generation-settings'
import { GenerationHistory } from '@/components/generation-history'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CustomerData {
  id: string
  title: string
  customer_name: string | null
  address: string | null
  phone: string | null
  email: string | null
  notes: string | null
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
  const [wallColor, setWallColor] = useState('変更なし')
  const [roofColor, setRoofColor] = useState('変更なし')
  const [doorColor, setDoorColor] = useState('変更なし')
  const [weather, setWeather] = useState('晴れ')
  const [layoutSideBySide, setLayoutSideBySide] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('白')
  const [otherInstructions, setOtherInstructions] = useState('')

  // Usage limit
  const [canGenerate, setCanGenerate] = useState(true)
  const [remainingGenerations, setRemainingGenerations] = useState(0)

  useEffect(() => {
    fetchCustomer()
    checkUsageLimit()
  }, [customerId])

  const fetchCustomer = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) {
      setError('顧客情報の取得に失敗しました')
      setLoading(false)
      return
    }

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
      formData.append('wallColor', wallColor)
      formData.append('roofColor', roofColor)
      formData.append('doorColor', doorColor)
      formData.append('weather', weather)
      formData.append('layoutSideBySide', layoutSideBySide.toString())
      formData.append('backgroundColor', backgroundColor)
      formData.append('otherInstructions', otherInstructions)

      // Call generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '生成に失敗しました')
      }

      // Refresh usage limit
      await checkUsageLimit()

      // Show success message and refresh history
      setError(null)
      window.location.reload()
    } catch (error: any) {
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
        <h1 className="text-3xl font-bold tracking-tight">{customer.title}</h1>
        <p className="text-muted-foreground mt-2">
          塗装シミュレーションを作成
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
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
              <ImageUpload
                label="横から見た建物の写真（オプション）"
                onChange={setSideImage}
                helperText="横から見た建物の写真を添付すると精度が上がります（なくてもOK）"
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
              <ColorSelector
                label="壁の色"
                value={wallColor}
                onChange={setWallColor}
              />
              <ColorSelector
                label="屋根の色"
                value={roofColor}
                onChange={setRoofColor}
              />
              <ColorSelector
                label="ドアの色"
                value={doorColor}
                onChange={setDoorColor}
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
                showSideImage={!!sideImage}
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
        </TabsContent>

        <TabsContent value="history">
          <GenerationHistory customerId={customerId} />
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>顧客情報</CardTitle>
              <CardDescription>
                この顧客の詳細情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>タイトル</Label>
                <p className="text-sm text-muted-foreground">{customer.title}</p>
              </div>
              {customer.customer_name && (
                <div>
                  <Label>顧客名</Label>
                  <p className="text-sm text-muted-foreground">{customer.customer_name}</p>
                </div>
              )}
              {customer.address && (
                <div>
                  <Label>住所</Label>
                  <p className="text-sm text-muted-foreground">{customer.address}</p>
                </div>
              )}
              {customer.phone && (
                <div>
                  <Label>電話番号</Label>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              )}
              {customer.email && (
                <div>
                  <Label>メールアドレス</Label>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              )}
              {customer.notes && (
                <div>
                  <Label>メモ</Label>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}