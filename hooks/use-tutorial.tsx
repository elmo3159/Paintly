'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface TutorialStep {
  id: string
  title: string
  description: string
  imageUrl?: string
  imageUrls?: string[] // 複数画像対応（横並び表示用）
  highlightElement?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Paintlyへようこそ！',
    description: 'Paintlyは、建物の塗装シミュレーションを瞬時に生成できるツールです。営業現場で撮影した写真を使って、お客様に塗装後のイメージを提示できます。',
    // ウェルカムステップは画像不要
  },
  {
    id: 'create-page',
    title: '顧客ページを作成',
    description: 'サイドバーの「＋」ボタンをクリックして、新しい顧客ページを作成できます。各顧客ごとに複数のシミュレーションを管理できます。',
    highlightElement: 'create-customer-button',
    imageUrl: '/tutorial/step2-create-customer.png',
  },
  {
    id: 'upload-image',
    title: '建物の写真をアップロード',
    description: '建物の正面写真をアップロードします。スマートフォンで撮影した写真をそのまま使用できます。',
    highlightElement: 'image-upload',
    imageUrl: '/tutorial/step3-image-upload.png',
  },
  {
    id: 'select-colors',
    title: '色を選択',
    description: '壁、屋根、ドアの色を選択できます。日塗工番号に対応したカラーパレットから選択します。変更しない部分は「変更なし」のままにしてください。',
    highlightElement: 'color-selector',
    imageUrl: '/tutorial/step4-color-selection.png',
  },
  {
    id: 'additional-options',
    title: '追加オプション',
    description: '天候の変更や、正面と横の写真を並べる機能など、追加オプションを設定できます。',
    highlightElement: 'additional-options',
    imageUrls: ['/tutorial/step5-weather.png', '/tutorial/step5-side-by-side.png'],
  },
  {
    id: 'generate',
    title: 'シミュレーション生成',
    description: '「生成」ボタンをクリックすると、AIが塗装後の画像を生成します。数秒でシミュレーション結果が表示されます。',
    highlightElement: 'generate-button',
    imageUrl: '/tutorial/step6-generate-button.png',
  },
  {
    id: 'history',
    title: '履歴とビフォーアフター',
    description: '生成された画像は履歴タブに保存されます。スライダーでビフォーアフターを比較したり、複数の候補を並べて比較できます。',
    highlightElement: 'history-tab',
    imageUrls: ['/tutorial/step7-history-tab.png', '/tutorial/step7-slider-comparison.png'],
  },
  {
    id: 'qr-code-share',
    title: 'QRコードで瞬時に共有',
    description: '履歴タブから「QRコードで共有」ボタンをクリックすると、お客様のスマートフォンで画像を即座に見ることができるQRコードが生成されます。営業現場でその場でお客様に画像を渡すことができます。',
    highlightElement: 'qr-share-button',
  },
  {
    id: 'download-pdf',
    title: 'ダウンロードとPDF出力',
    description: '生成した画像はダウンロードしたり、PDF形式で出力できます。お客様への提案資料として活用できます。',
    highlightElement: 'download-buttons',
    imageUrl: '/tutorial/step9-download-pdf.png',
  },
]

// Tutorial Context
interface TutorialContextType {
  isOpen: boolean
  currentStep: number
  totalSteps: number
  currentStepData: TutorialStep
  hasCompletedTutorial: boolean
  isLoading: boolean
  nextStep: () => void
  previousStep: () => void
  skipTutorial: () => Promise<void>
  completeTutorial: () => Promise<void>
  restartTutorial: () => void
  openTutorial: () => void
  closeTutorial: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // チュートリアル画像のプリロード
  useEffect(() => {
    // すべてのチュートリアル画像を事前に読み込む
    tutorialSteps.forEach(step => {
      if (step.imageUrl) {
        const img = new Image()
        img.src = step.imageUrl
      }
      if (step.imageUrls) {
        step.imageUrls.forEach(url => {
          const img = new Image()
          img.src = url
        })
      }
    })
  }, [])

  // 初回ログイン検知とチュートリアル表示判定
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        // ユーザーメタデータからチュートリアル完了状態を取得
        const tutorialCompleted = user.user_metadata?.tutorial_completed || false
        setHasCompletedTutorial(tutorialCompleted)

        // チュートリアル未完了の場合、自動的に開く
        if (!tutorialCompleted) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkTutorialStatus()
  }, [supabase])

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // ユーザーメタデータを更新してチュートリアル完了をマーク
        await supabase.auth.updateUser({
          data: { tutorial_completed: true }
        })
      }
      
      setHasCompletedTutorial(true)
      setIsOpen(false)
      setCurrentStep(0)
    } catch (error) {
      console.error('Error skipping tutorial:', error)
    }
  }, [supabase])

  const completeTutorial = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // ユーザーメタデータを更新してチュートリアル完了をマーク
        await supabase.auth.updateUser({
          data: { tutorial_completed: true }
        })
      }
      
      setHasCompletedTutorial(true)
      setIsOpen(false)
      setCurrentStep(0)
    } catch (error) {
      console.error('Error completing tutorial:', error)
    }
  }, [supabase])

  const restartTutorial = useCallback(() => {
    setCurrentStep(0)
    setIsOpen(true)
  }, [])

  const value: TutorialContextType = {
    isOpen,
    currentStep,
    totalSteps: tutorialSteps.length,
    currentStepData: tutorialSteps[currentStep],
    hasCompletedTutorial,
    isLoading,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    restartTutorial,
    openTutorial: () => setIsOpen(true),
    closeTutorial: () => setIsOpen(false),
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}
