'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Upload, Palette, Sparkles, CheckCircle, Clock } from 'lucide-react'

interface LoadingStage {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  duration: number // estimated duration in seconds
}

interface EnhancedLoadingProps {
  isVisible: boolean
  provider: string
  onComplete?: () => void
}

const loadingStages: Record<string, LoadingStage[]> = {
  'fal-ai': [
    {
      id: 'upload',
      label: '画像アップロード',
      description: '建物の画像をサーバーに送信中...',
      icon: <Upload className="h-4 w-4" />,
      duration: 3
    },
    {
      id: 'analysis',
      label: '画像解析',
      description: 'AI が建物の構造を分析中...',
      icon: <Palette className="h-4 w-4" />,
      duration: 8
    },
    {
      id: 'generation',
      label: '画像生成',
      description: 'Fal AI で塗装後の画像を生成中...',
      icon: <Sparkles className="h-4 w-4" />,
      duration: 45
    },
    {
      id: 'processing',
      label: '仕上げ処理',
      description: '画像の最適化と保存を実行中...',
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 5
    }
  ],
  'gemini': [
    {
      id: 'upload',
      label: '画像アップロード',
      description: '建物の画像をサーバーに送信中...',
      icon: <Upload className="h-4 w-4" />,
      duration: 2
    },
    {
      id: 'analysis',
      label: '画像解析',
      description: 'Gemini AI が建物の特徴を理解中...',
      icon: <Palette className="h-4 w-4" />,
      duration: 5
    },
    {
      id: 'generation',
      label: '画像生成',
      description: 'Google Gemini で高品質な塗装画像を生成中...',
      icon: <Sparkles className="h-4 w-4" />,
      duration: 15
    },
    {
      id: 'processing',
      label: '仕上げ処理',
      description: '画像の保存とデータベース更新中...',
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 3
    }
  ]
}

export function EnhancedLoading({ isVisible, provider, onComplete }: EnhancedLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)

  const stages = loadingStages[provider] || loadingStages['gemini']
  const currentStage = stages[currentStageIndex]

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0)
      setProgress(0)
      setElapsedTime(0)
      setEstimatedTimeRemaining(0)
      return
    }

    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0)
    setEstimatedTimeRemaining(totalDuration)

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + 1
        
        // Calculate which stage we should be in
        let accumulatedTime = 0
        let newStageIndex = 0
        
        for (let i = 0; i < stages.length; i++) {
          if (newElapsed <= accumulatedTime + stages[i].duration) {
            newStageIndex = i
            break
          }
          accumulatedTime += stages[i].duration
          newStageIndex = i + 1
        }

        // Update stage if changed
        if (newStageIndex !== currentStageIndex && newStageIndex < stages.length) {
          setCurrentStageIndex(newStageIndex)
        }

        // Calculate progress within current stage
        const stageStartTime = stages.slice(0, newStageIndex).reduce((sum, stage) => sum + stage.duration, 0)
        const stageProgress = newStageIndex < stages.length 
          ? ((newElapsed - stageStartTime) / stages[newStageIndex].duration) * 100
          : 100

        // Calculate overall progress
        const overallProgress = Math.min((newElapsed / totalDuration) * 100, 100)
        setProgress(overallProgress)

        // Update estimated time remaining
        setEstimatedTimeRemaining(Math.max(0, totalDuration - newElapsed))

        // Complete if finished
        if (newElapsed >= totalDuration) {
          setTimeout(() => {
            onComplete?.()
          }, 500)
        }

        return newElapsed
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, provider, stages, currentStageIndex, onComplete])

  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">画像生成中</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {provider === 'fal-ai' ? 'Fal AI' : 'Google Gemini'} で処理中...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(progress)}% 完了</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>残り約 {formatTime(estimatedTimeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Current Stage */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg border">
              <div className="flex-shrink-0 text-primary">
                {currentStage?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{currentStage?.label}</p>
                <p className="text-sm text-muted-foreground">{currentStage?.description}</p>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
            </div>

            {/* Stage List */}
            <div className="space-y-2">
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex
                const isCurrent = index === currentStageIndex
                const isPending = index > currentStageIndex

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                      isCurrent 
                        ? 'bg-primary/10 border border-primary/20' 
                        : isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      isCurrent 
                        ? 'text-primary' 
                        : isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        stage.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isCurrent 
                          ? 'text-primary' 
                          : isCompleted 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stage.label}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 ヒント: {provider === 'fal-ai' 
                ? '高品質な結果のため、少し時間がかかる場合があります' 
                : 'Gemini は高速ですが、複雑な建物では時間がかかることがあります'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}