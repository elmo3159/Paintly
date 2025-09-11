'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>エラーが発生しました</CardTitle>
          </div>
          <CardDescription>
            申し訳ございません。予期せぬエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => reset()} variant="default" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              ページを再読み込み
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              ホームへ
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            問題が続く場合は、サポートまでお問い合わせください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}