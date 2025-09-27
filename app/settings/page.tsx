'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Lock, CheckCircle, AlertCircle, Palette, Paintbrush } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/10">
        <div className="text-center space-y-4">
          <div className="relative">
            <Palette className="h-12 w-12 text-primary animate-pulse mx-auto" />
          </div>
          <p className="text-muted-foreground font-medium">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/10 p-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">設定</h1>
          <p className="text-muted-foreground">アカウントとプロフィールの管理</p>
        </div>

        {/* アラート表示 */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* プロフィール設定 */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>プロフィール設定</CardTitle>
                  <CardDescription>営業担当者情報と会社情報を設定</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sales_person_name">営業担当者名</Label>
                  <Input
                    id="sales_person_name"
                    value={profile.sales_person_name}
                    onChange={(e) => setProfile({...profile, sales_person_name: e.target.value})}
                    placeholder="例: 田中太郎"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">会社名</Label>
                  <Input
                    id="company_name"
                    value={profile.company_name}
                    onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                    placeholder="例: 株式会社ペイントワークス"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_info">連絡先</Label>
                <Input
                  id="contact_info"
                  value={profile.contact_info}
                  onChange={(e) => setProfile({...profile, contact_info: e.target.value})}
                  placeholder="例: tanaka@paintworks.co.jp または 03-1234-5678"
                />
              </div>
              <Button 
                onClick={handleProfileSave}
                disabled={saving}
                className="w-full md:w-auto"
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
            </CardContent>
          </Card>



          {/* パスワード変更 */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>パスワード変更</CardTitle>
                  <CardDescription>アカウントのセキュリティを保護するためパスワードを変更</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">現在のパスワード</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="現在のパスワードを入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">新しいパスワード</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8文字以上の新しいパスワード"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">新しいパスワード（確認）</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="新しいパスワードを再入力"
                  />
                </div>
              </div>
              <Button 
                onClick={handlePasswordChange}
                disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full md:w-auto"
                variant="outline"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}