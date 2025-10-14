'use client'

import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useTutorial } from '@/hooks/use-tutorial'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export function TutorialModal() {
  const {
    isOpen,
    currentStep,
    totalSteps,
    currentStepData,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    closeTutorial,
  } = useTutorial()

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  // ハイライト要素の処理
  useEffect(() => {
    if (!isOpen || !currentStepData.highlightElement) return

    const element = document.querySelector(`[data-tutorial="${currentStepData.highlightElement}"]`)
    if (element) {
      element.classList.add('tutorial-highlight')
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return () => {
      if (element) {
        element.classList.remove('tutorial-highlight')
      }
    }
  }, [isOpen, currentStepData])

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial()
    } else {
      nextStep()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeTutorial}>
        <DialogPortal>
          {/* カスタムオーバーレイ - 透明度を低くしてハイライトを見やすくする */}
          <DialogOverlay className="bg-black/30" />
          <div className={`fixed left-[50%] top-[50%] z-[100] grid w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] gap-2 border-2 border-primary/30 bg-white dark:bg-gray-900 p-3 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg overflow-y-auto ${
            currentStepData.id === 'select-colors' ? 'max-h-[90dvh]' : 'max-h-[90dvh]'
          }`}>
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-bold text-primary">
              {currentStepData.title}
            </DialogTitle>
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>ステップ {currentStep + 1} / {totalSteps}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <DialogDescription className="text-sm leading-snug text-foreground">
              {currentStepData.description}
            </DialogDescription>

            {/* 画像がある場合は表示 */}
            {currentStepData.imageUrl && (
              <div className="rounded-lg border bg-muted p-2">
                <img
                  key={`${currentStepData.id}-${currentStepData.imageUrl}`}
                  src={currentStepData.imageUrl}
                  alt={currentStepData.title}
                  loading="eager"
                  className={`w-full rounded-md ${
                    currentStepData.id === 'select-colors' ? 'max-h-32 object-contain' : 'max-h-40 object-contain'
                  }`}
                />
              </div>
            )}

            {/* 複数画像がある場合は横並びで表示 */}
            {currentStepData.imageUrls && currentStepData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {currentStepData.imageUrls.map((url, index) => (
                  <div key={`${currentStepData.id}-${index}`} className="rounded-lg border bg-muted p-2">
                    <img
                      key={`${currentStepData.id}-img-${index}-${url}`}
                      src={url}
                      alt={`${currentStepData.title} - ${index + 1}`}
                      loading="eager"
                      className="w-full rounded-md max-h-32 object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ウェルカムステップの特別なコンテンツ */}
            {currentStep === 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                <h4 className="font-semibold text-primary text-sm">Paintlyでできること</h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>建物の写真から瞬時に塗装シミュレーションを生成</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>日塗工番号に対応した豊富なカラーパレット</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>ビフォーアフター比較とスライダー機能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>複数の候補を並べて比較</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>PDF形式でダウンロード・提案資料として活用</span>
                  </li>
                </ul>
              </div>
            )}

            {/* 最終ステップの特別なコンテンツ */}
            {isLastStep && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5">
                <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm">
                  チュートリアル完了！
                </h4>
                <p className="text-xs text-muted-foreground">
                  これでPaintlyの基本的な使い方をマスターしました。さっそく新しい顧客ページを作成して、塗装シミュレーションを始めましょう！
                </p>
              </div>
            )}
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={skipTutorial}
              className="flex-1 sm:flex-none"
            >
              スキップ
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isFirstStep}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>

              <Button
                onClick={handleNext}
                className="px-6"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    完了
                  </>
                ) : (
                  <>
                    次へ
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  )
}
