import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ImageIcon } from 'lucide-react'
import Image from 'next/image'

export async function TrialImageSection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // ユーザーのプラン情報を取得
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select(`
      plan:plans (
        generation_limit
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  // 無料プラン（generation_limit <= 3）の場合のみ表示
  const generationLimit = subscriptionData?.plan ? (subscriptionData.plan as any).generation_limit : 3
  if (generationLimit > 3) {
    return null
  }

  return (
    <Card className="paint-card relative z-10 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2" style={{ fontFamily: 'var(--font-handwritten)', fontWeight: 700, color: 'var(--brand)' }}>
          <ImageIcon className="h-6 w-6 text-orange-600" />
          お試し用の建物画像
        </CardTitle>
        <CardDescription className="text-base">
          画像をお持ちでない方へ：こちらの画像でPaintlyを体験できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png"
              alt="お試し用建物画像"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 space-y-1">
              <p className="font-semibold">📱 スマホの場合：</p>
              <p>画像を<strong className="text-blue-700">長押し</strong>して「画像を保存」を選択</p>
              <p className="font-semibold mt-2">💻 PCの場合：</p>
              <p>画像を<strong className="text-blue-700">右クリック</strong>して「名前を付けて画像を保存」を選択</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>この画像を使って、塗装シミュレーションの流れを体験してみましょう！</p>
        </div>
      </CardContent>
    </Card>
  )
}
