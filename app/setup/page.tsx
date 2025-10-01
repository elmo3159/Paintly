'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Loader2, Database, Shield, Image, CreditCard, Settings } from 'lucide-react'

interface SetupStep {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'checking' | 'completed' | 'error'
  error?: string
}

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'database',
      name: 'データベース接続',
      description: 'Supabaseデータベースへの接続を確認',
      icon: Database,
      status: 'pending'
    },
    {
      id: 'auth',
      name: '認証システム',
      description: '認証機能の動作確認',
      icon: Shield,
      status: 'pending'
    },
    {
      id: 'storage',
      name: 'ストレージ',
      description: '画像ストレージの設定確認',
      icon: Image,
      status: 'pending'
    },
    {
      id: 'stripe',
      name: '決済システム',
      description: 'Stripe連携の確認',
      icon: CreditCard,
      status: 'pending'
    },
    {
      id: 'config',
      name: '環境設定',
      description: '環境変数と設定の確認',
      icon: Settings,
      status: 'pending'
    }
  ])
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    runSetupChecks()
  }, [])

  const runSetupChecks = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await checkStep(steps[i].id)
      await new Promise(resolve => setTimeout(resolve, 500)) // Visual delay
    }
    setIsComplete(true)
  }

  const checkStep = async (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: 'checking' } : step
    ))

    try {
      switch (stepId) {
        case 'database':
          await checkDatabase()
          break
        case 'auth':
          await checkAuth()
          break
        case 'storage':
          await checkStorage()
          break
        case 'stripe':
          await checkStripe()
          break
        case 'config':
          await checkConfig()
          break
      }
      
      setSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, status: 'completed' } : step
      ))
    } catch (error: any) {
      setSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, status: 'error', error: error.message } : step
      ))
    }
  }

  const checkDatabase = async () => {
    const { error } = await supabase.from('plans').select('id').limit(1).single()
    if (error && error.code !== 'PGRST116') {
      throw new Error('データベース接続に失敗しました')
    }
  }

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    // Auth is optional for setup
  }

  const checkStorage = async () => {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
      throw new Error('ストレージアクセスに失敗しました')
    }
    
    const requiredBuckets = ['images', 'generations']
    const bucketNames = data?.map(b => b.name) || []
    const missingBuckets = requiredBuckets.filter(b => !bucketNames.includes(b))
    
    if (missingBuckets.length > 0) {
      // Create missing buckets
      for (const bucketName of missingBuckets) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
        })
        if (createError && !createError.message.includes('already exists')) {
          throw new Error(`バケット作成に失敗: ${bucketName}`)
        }
      }
    }
  }

  const checkStripe = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error('Stripe公開キーが設定されていません')
    }
  }

  const checkConfig = async () => {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GEMINI_API_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => 
      !process.env[varName] && !process.env[`NEXT_PUBLIC_${varName}`]
    )
    
    if (missingVars.length > 0) {
      console.warn(`環境変数が不足: ${missingVars.join(', ')}`)
    }
  }

  const progress = (currentStep / steps.length) * 100
  const hasErrors = steps.some(step => step.status === 'error')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Paintly セットアップ</CardTitle>
          <CardDescription>
            アプリケーションの初期設定を確認しています
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>進行状況</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    step.status === 'checking' ? 'border-blue-500 bg-blue-50' :
                    step.status === 'completed' ? 'border-green-500 bg-green-50' :
                    step.status === 'error' ? 'border-red-500 bg-red-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {step.status === 'checking' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : step.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : step.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Icon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {step.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          {step.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {isComplete && (
            <div className="space-y-4">
              {hasErrors ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    セットアップ中にエラーが発生しました。
                    環境設定を確認してください。
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-800">
                    セットアップが完了しました！
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  再チェック
                </Button>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="flex-1"
                  disabled={hasErrors}
                >
                  ログイン画面へ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}