'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    property_address: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('認証が必要です')
      }

      // ユーザーのプラン情報を取得
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', user.id)
        .single()

      if (!subscription) {
        throw new Error('プラン情報が見つかりません')
      }

      // プラン詳細を取得
      const { data: plan } = await supabase
        .from('plans')
        .select('max_customer_pages')
        .eq('id', subscription.plan_id)
        .single()

      // プランの顧客ページ制限を確認
      const maxPages = plan?.max_customer_pages ?? -1

      if (maxPages !== -1) {
        // 現在の顧客ページ数をカウント
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (count !== null && count >= maxPages) {
          alert(`顧客ページの作成上限（${maxPages}件）に達しました。有料プランにアップグレードしてください。`)
          setIsLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          title: formData.customer_name || `新規顧客 ${new Date().toLocaleDateString('ja-JP')}`,
          customer_name: formData.customer_name,
          address: formData.property_address,
          notes: formData.notes
        })
        .select()
        .single()

      if (error) {
        console.error('Customer creation error:', error)
        throw error
      }

      router.push(`/customer/${data.id}`)
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('顧客ページの作成中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">新規顧客ページ作成</h1>
        <p className="text-muted-foreground mt-2">
          新しい顧客の情報を入力してページを作成します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>顧客情報</span>
          </CardTitle>
          <CardDescription>
            顧客情報を入力してください（すべて任意入力）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">顧客名</Label>
              <Input
                id="customer_name"
                type="text"
                placeholder="例: 田中太郎"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_address">物件住所</Label>
              <Input
                id="property_address"
                type="text"
                placeholder="例: 東京都渋谷区..."
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">メモ</Label>
              <Textarea
                id="notes"
                placeholder="顧客に関するメモやコメント..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    顧客ページを作成
                  </>
                )}
              </Button>
              
              <Link href="/dashboard">
                <Button type="button" variant="outline" disabled={isLoading}>
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}