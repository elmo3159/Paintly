'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, AlertCircle, Upload, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_OPTIONS = [
  { value: 'feature_request', label: '機能要望' },
  { value: 'bug_report', label: 'バグ報告' },
  { value: 'question', label: '使い方の質問' },
  { value: 'other', label: 'その他' },
]

export function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const supabase = createClient()
  const [category, setCategory] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [currentPlan, setCurrentPlan] = useState<string>('')

  // ユーザー情報取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email || '')

          // プラン情報取得
          const { data: planData } = await supabase
            .from('subscriptions')
            .select('plans(name)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

          if (planData && planData.plans) {
            setCurrentPlan((planData.plans as any).name || '無料プラン')
          } else {
            setCurrentPlan('無料プラン')
          }
        }
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err)
      }
    }

    if (isOpen) {
      fetchUserInfo()
    }
  }, [isOpen, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        setError('画像サイズは5MB以下にしてください。')
        return
      }
      setScreenshotFile(file)
      setError(null)
    }
  }

  const removeScreenshot = () => {
    setScreenshotFile(null)
  }

  const resetForm = () => {
    setCategory('')
    setSubject('')
    setMessage('')
    setScreenshotFile(null)
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('ユーザー情報が取得できませんでした。')
        setLoading(false)
        return
      }

      // ブラウザ情報取得
      const browserInfo = `${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`

      let screenshotUrl = null

      // スクリーンショットアップロード
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop()
        const fileName = `inquiry-screenshots/${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('customer-images')
          .upload(fileName, screenshotFile)

        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError)
          setError('画像のアップロードに失敗しました。')
          setLoading(false)
          return
        }

        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from('customer-images')
          .getPublicUrl(fileName)

        screenshotUrl = urlData.publicUrl
      }

      // DB保存
      const { error: insertError } = await supabase
        .from('inquiries')
        .insert({
          user_id: user.id,
          user_email: userEmail,
          current_plan: currentPlan,
          category,
          subject: subject.trim() || null,
          message: message.trim(),
          screenshot_url: screenshotUrl,
          browser_info: browserInfo,
        })

      if (insertError) {
        console.error('DB保存エラー:', insertError)
        setError('お問い合わせの送信に失敗しました。')
        setLoading(false)
        return
      }

      // メール送信API呼び出し
      const emailResponse = await fetch('/api/send-inquiry-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim() || '（件名なし）',
          message: message.trim(),
          userEmail,
          currentPlan,
          screenshotUrl,
          browserInfo,
        }),
      })

      if (!emailResponse.ok) {
        console.error('メール送信エラー:', await emailResponse.text())
        // メール送信失敗してもDBには保存されているのでエラーにしない
      }

      setSuccess(true)
      setTimeout(() => {
        resetForm()
        onClose()
      }, 2000)

    } catch (err) {
      console.error('送信エラー:', err)
      setError('予期しないエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">お問い合わせ</DialogTitle>
          <DialogDescription>
            機能要望、バグ報告、ご質問など、お気軽にお問い合わせください。
            1〜3営業日以内にご返信いたします。
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              お問い合わせを受け付けました。ご連絡ありがとうございます！
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリー<span className="text-red-500">*</span></Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">件名（任意）</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例: カラー選択機能について"
                maxLength={100}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">本文<span className="text-red-500">*</span></Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="できるだけ詳しくお書きください"
                rows={6}
                required
                maxLength={2000}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 text-right">
                {message.length} / 2000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">スクリーンショット（任意）</Label>
              {screenshotFile ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={URL.createObjectURL(screenshotFile)}
                    alt="プレビュー"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{screenshotFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(screenshotFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeScreenshot}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <Label
                    htmlFor="screenshot"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    画像を選択
                  </Label>
                  <p className="text-xs text-gray-500">5MB以下のPNG/JPG</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="text-xs font-medium text-gray-700">送信される情報</p>
              <p className="text-xs text-gray-600">メールアドレス: {userEmail}</p>
              <p className="text-xs text-gray-600">現在のプラン: {currentPlan}</p>
              <p className="text-xs text-gray-500">ブラウザ情報も自動的に含まれます</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                disabled={loading}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading || !category || !message.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  '送信する'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
