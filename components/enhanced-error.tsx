'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  X,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

export type ErrorType = 'network' | 'validation' | 'api' | 'auth' | 'quota' | 'upload' | 'processing' | 'unknown'

export interface EnhancedErrorProps {
  error: string | null
  errorType?: ErrorType
  onRetry?: () => void
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
  showDetails?: boolean
}

interface ErrorInfo {
  icon: React.ReactNode
  title: string
  severity: 'warning' | 'error' | 'info'
  color: string
  bgColor: string
  suggestions: string[]
}

const errorMapping: Record<ErrorType, ErrorInfo> = {
  network: {
    icon: <WifiOff className="h-4 w-4" />,
    title: 'ネットワークエラー',
    severity: 'warning',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    suggestions: [
      'インターネット接続を確認してください',
      '数秒後に再試行してください',
      'Wi-Fiまたはモバイルデータを切り替えてみてください'
    ]
  },
  validation: {
    icon: <AlertTriangle className="h-4 w-4" />,
    title: '入力エラー',
    severity: 'warning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    suggestions: [
      '必須項目が正しく入力されているか確認してください',
      '画像形式がサポートされているか確認してください（JPEG, PNG）',
      'ファイルサイズが10MB以下であることを確認してください'
    ]
  },
  api: {
    icon: <XCircle className="h-4 w-4" />,
    title: 'サーバーエラー',
    severity: 'error',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    suggestions: [
      'しばらく時間を置いてから再試行してください',
      'サーバーメンテナンス中の可能性があります',
      '問題が続く場合はサポートにお問い合わせください'
    ]
  },
  auth: {
    icon: <AlertCircle className="h-4 w-4" />,
    title: '認証エラー',
    severity: 'error',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    suggestions: [
      'ログインし直してください',
      'セッションが期限切れの可能性があります',
      'アカウントの状態を確認してください'
    ]
  },
  quota: {
    icon: <AlertTriangle className="h-4 w-4" />,
    title: '利用制限エラー',
    severity: 'warning',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    suggestions: [
      '月間の生成回数上限に達している可能性があります',
      'プランのアップグレードをご検討ください',
      '来月まで待つか、上位プランにアップグレードしてください'
    ]
  },
  upload: {
    icon: <AlertCircle className="h-4 w-4" />,
    title: 'アップロードエラー',
    severity: 'warning',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    suggestions: [
      'ファイルサイズが大きすぎる可能性があります（10MB以下に調整）',
      'サポートされている形式（JPEG, PNG, WebP）を使用してください',
      '画像が破損していないか確認してください'
    ]
  },
  processing: {
    icon: <RefreshCw className="h-4 w-4" />,
    title: '処理エラー',
    severity: 'error',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    suggestions: [
      'AI処理中にエラーが発生しました',
      '異なる画像で再試行してください',
      '建物がはっきり写っている画像を使用してください'
    ]
  },
  unknown: {
    icon: <HelpCircle className="h-4 w-4" />,
    title: '予期しないエラー',
    severity: 'error',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    suggestions: [
      'ページを再読み込みしてみてください',
      'ブラウザのキャッシュをクリアしてみてください',
      '問題が続く場合はサポートにお問い合わせください'
    ]
  }
}

// エラーメッセージからエラータイプを自動判定
const detectErrorType = (error: string): ErrorType => {
  const lowerError = error.toLowerCase()
  
  if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
    return 'network'
  }
  if (lowerError.includes('auth') || lowerError.includes('unauthorized') || lowerError.includes('forbidden')) {
    return 'auth'
  }
  if (lowerError.includes('quota') || lowerError.includes('limit') || lowerError.includes('exceeded')) {
    return 'quota'
  }
  if (lowerError.includes('upload') || lowerError.includes('file') || lowerError.includes('size')) {
    return 'upload'
  }
  if (lowerError.includes('processing') || lowerError.includes('generation') || lowerError.includes('ai')) {
    return 'processing'
  }
  if (lowerError.includes('validation') || lowerError.includes('invalid') || lowerError.includes('required')) {
    return 'validation'
  }
  if (lowerError.includes('server') || lowerError.includes('500') || lowerError.includes('502') || lowerError.includes('503')) {
    return 'api'
  }
  
  return 'unknown'
}

// エラーメッセージをユーザーフレンドリーに変換
const getFriendlyErrorMessage = (error: string, errorType: ErrorType): string => {
  const lowerError = error.toLowerCase()
  
  // ネットワークエラー
  if (errorType === 'network') {
    return 'インターネット接続に問題があります。接続を確認して再試行してください。'
  }
  
  // 認証エラー
  if (errorType === 'auth') {
    return 'ログインセッションが期限切れです。再度ログインしてください。'
  }
  
  // 利用制限エラー
  if (errorType === 'quota') {
    return '月間の生成回数上限に達しました。プランのアップグレードまたは来月までお待ちください。'
  }
  
  // アップロードエラー
  if (errorType === 'upload') {
    if (lowerError.includes('size')) {
      return 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。'
    }
    if (lowerError.includes('format') || lowerError.includes('type')) {
      return 'サポートされていないファイル形式です。JPEG、PNG、WebPファイルを使用してください。'
    }
    return 'ファイルのアップロードに失敗しました。ファイル形式とサイズを確認してください。'
  }
  
  // 処理エラー
  if (errorType === 'processing') {
    return 'AI画像生成中にエラーが発生しました。建物がはっきり写っている画像で再試行してください。'
  }
  
  // バリデーションエラー
  if (errorType === 'validation') {
    return '入力内容に問題があります。必須項目がすべて正しく入力されているか確認してください。'
  }
  
  // サーバーエラー
  if (errorType === 'api') {
    return 'サーバーで問題が発生しています。しばらく時間を置いてから再試行してください。'
  }
  
  // 元のエラーメッセージをそのまま返す（フォールバック）
  return error
}

export function EnhancedError({ 
  error, 
  errorType: providedErrorType, 
  onRetry, 
  onDismiss, 
  autoHide = false, 
  autoHideDelay = 5000,
  showDetails = false 
}: EnhancedErrorProps) {
  const [isVisible, setIsVisible] = useState(!!error)
  const [showDetailedView, setShowDetailedView] = useState(false)

  const detectedErrorType = providedErrorType || (error ? detectErrorType(error) : 'unknown')
  const errorInfo = errorMapping[detectedErrorType]
  const friendlyMessage = error ? getFriendlyErrorMessage(error, detectedErrorType) : ''

  useEffect(() => {
    setIsVisible(!!error)
    if (error && autoHide) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [error, autoHide, autoHideDelay])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!error || !isVisible) return null

  return (
    <div className="space-y-4">
      {/* Main Error Alert */}
      <Alert className={`${errorInfo.bgColor} border`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${errorInfo.color}`}>
            {errorInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <AlertTitle className={`${errorInfo.color} font-semibold`}>
              {errorInfo.title}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {friendlyMessage}
            </AlertDescription>
          </div>
          <div className="flex items-center space-x-2">
            {showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="h-8 px-2"
              >
                詳細
              </Button>
            )}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8 px-3"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                再試行
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>

      {/* Detailed Error View */}
      {showDetailedView && (
        <Card className={`${errorInfo.bgColor} border`}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className={`${errorInfo.color} font-semibold mb-2`}>解決方法</h4>
                <ul className="space-y-1 text-sm">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className={`${errorInfo.color} mt-1`}>•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {showDetails && (
                <div>
                  <h4 className={`${errorInfo.color} font-semibold mb-2`}>技術詳細</h4>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all">
                    {error}
                  </code>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  エラータイプ: {detectedErrorType}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('mailto:support@paintly.app', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  サポートに連絡
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 便利なフック
export function useEnhancedError() {
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<ErrorType>('unknown')

  const showError = (errorMessage: string, type?: ErrorType) => {
    setError(errorMessage)
    setErrorType(type || detectErrorType(errorMessage))
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    errorType,
    showError,
    clearError
  }
}