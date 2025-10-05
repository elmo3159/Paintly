'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, CheckCircle, AlertCircle, Palette, Paintbrush, ArrowLeft, Sparkles } from 'lucide-react'

interface UserProfile {
  sales_person_name?: string
  company_name?: string
  contact_info?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // プロフィール設定
  const [profile, setProfile] = useState<UserProfile>({
    sales_person_name: '',
    company_name: '',
    contact_info: ''
  })

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    checkUserAndLoadProfile()
  }, [])

  const checkUserAndLoadProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/signin')
      return
    }

    // ユーザープロフィールを読み込み (エラーハンドリング強化)
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('sales_person_name, company_name, contact_info')
        .eq('user_id', user.id)
        .single()

      if (!error && profileData) {
        setProfile({
          sales_person_name: profileData.sales_person_name || '',
          company_name: profileData.company_name || '',
          contact_info: profileData.contact_info || ''
        })
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116はレコードが見つからない場合のエラーなので無視
        console.log('Profile load error (non-critical):', error)
      }
    } catch (err) {
      console.log('Profile loading failed (non-critical):', err)
      // エラーが発生してもデフォルト値のまま続行
    }

    setLoading(false)
  }

  const handleProfileSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          sales_person_name: profile.sales_person_name,
          company_name: profile.company_name,
          contact_info: profile.contact_info,
          updated_at: new Date().toISOString()
        })

      if (error) {
        // テーブルが存在しない場合の詳細なエラーメッセージ
        if (error.code === '42P01') {
          throw new Error('プロフィール機能を使用するには、データベースの設定が必要です。管理者にお問い合わせください。')
        }
        throw error
      }

      setSuccess('プロフィール設定を保存しました')
    } catch (err: any) {
      console.error('Profile save error:', err)
      setError(err.message || 'プロフィール設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setChangingPassword(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認パスワードが一致しません')
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります')
      setChangingPassword(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess('パスワードを変更しました')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'パスワードの変更に失敗しました')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Palette className="h-16 w-16 text-gray-900 animate-pulse mx-auto" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-gray-600 animate-bounce" />
          </div>
          <p className="text-gray-900 font-medium text-lg">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* 戻るボタン付きヘッダー */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </Button>
        </div>
      </div>

      {/* スクロール可能なメインコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8 pb-20 space-y-8">
          {/* ヘッダー */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                  <User className="h-12 w-12 text-gray-900" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gray-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">設定</h1>
            <p className="text-gray-600 text-lg">アカウントとプロフィールの管理</p>
          </div>

          {/* アラート表示 */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="grid gap-6">
            {/* プロフィール設定 */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">プロフィール設定</h2>
                    <p className="text-gray-600 text-sm mt-1">営業担当者情報と会社情報を設定</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sales_person_name" className="text-gray-900 font-medium">営業担当者名</Label>
                    <Input
                      id="sales_person_name"
                      value={profile.sales_person_name}
                      onChange={(e) => setProfile({...profile, sales_person_name: e.target.value})}
                      placeholder="例: 田中太郎"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-gray-900 font-medium">会社名</Label>
                    <Input
                      id="company_name"
                      value={profile.company_name}
                      onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                      placeholder="例: 株式会社ペイントワークス"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_info" className="text-gray-900 font-medium">連絡先</Label>
                  <Input
                    id="contact_info"
                    value={profile.contact_info}
                    onChange={(e) => setProfile({...profile, contact_info: e.target.value})}
                    placeholder="例: tanaka@paintworks.co.jp または 03-1234-5678"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                  />
                </div>
                <Button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {saving ? (
                    <>
                      <Paintbrush className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      プロフィール設定を保存
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* パスワード変更 */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Lock className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">パスワード変更</h2>
                    <p className="text-gray-600 text-sm mt-1">アカウントのセキュリティを保護するためパスワードを変更</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-gray-900 font-medium">現在のパスワード</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="現在のパスワードを入力"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-gray-900 font-medium">新しいパスワード</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8文字以上の新しいパスワード"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-gray-900 font-medium">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="新しいパスワードを再入力"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 transition-all"
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {changingPassword ? (
                    <>
                      <Lock className="mr-2 h-4 w-4 animate-spin" />
                      変更中...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      パスワードを変更
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
