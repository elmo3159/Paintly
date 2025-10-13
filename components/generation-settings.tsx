'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScreenReaderOnly } from '@/components/accessibility-helpers'

// Client-side error reporting function
const reportClientError = (error: Error, context: string) => {
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          component: 'GenerationSettings'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

interface GenerationSettingsProps {
  layoutSideBySide: boolean
  onLayoutSideBySideChange: (value: boolean) => void
  backgroundColor: string
  onBackgroundColorChange: (value: string) => void
  sideImage: File | null
  onSideImageChange: (file: File | null) => void
  otherInstructions: string
  onOtherInstructionsChange: (value: string) => void
}

export function GenerationSettings({
  layoutSideBySide,
  onLayoutSideBySideChange,
  backgroundColor,
  onBackgroundColorChange,
  sideImage,
  onSideImageChange,
  otherInstructions,
  onOtherInstructionsChange
}: GenerationSettingsProps) {

  // Enhanced error handling for checkbox change
  const handleLayoutSideBySideChange = (value: boolean) => {
    try {
      console.log('🔄 Layout side-by-side change:', value)
      onLayoutSideBySideChange(value)
    } catch (error) {
      const changeError = error instanceof Error ? error : new Error('Unknown error in layout change')
      console.error('❌ Error changing layout side-by-side:', changeError)
      reportClientError(changeError, `Layout side-by-side change - Value: ${value}`)

      // Show user-friendly error message
      alert('レイアウト設定の変更に失敗しました。再試行してください。')
    }
  }

  // Enhanced error handling for background color change
  const handleBackgroundColorChange = (value: string) => {
    try {
      console.log('🎨 Background color change:', value)

      // Validate color value
      const validColors = ['白', '黒', '薄ピンク']
      if (!validColors.includes(value)) {
        throw new Error(`Invalid background color: ${value}`)
      }

      onBackgroundColorChange(value)
    } catch (error) {
      const colorError = error instanceof Error ? error : new Error('Unknown error in background color change')
      console.error('❌ Error changing background color:', colorError)
      reportClientError(colorError, `Background color change - Value: ${value}`)

      // Show user-friendly error message
      alert('背景色の変更に失敗しました。再試行してください。')
    }
  }

  // Enhanced error handling for side image change
  const handleSideImageChange = (file: File | null) => {
    try {
      console.log('📷 Side image change:', file ? `File: ${file.name}` : 'File removed')
      onSideImageChange(file)
    } catch (error) {
      const imageError = error instanceof Error ? error : new Error('Unknown error in side image change')
      console.error('❌ Error changing side image:', imageError)
      reportClientError(imageError, `Side image change - File: ${file?.name || 'null'}`)

      // Show user-friendly error message
      alert('横画像の変更に失敗しました。再試行してください。')
    }
  }

  // Enhanced error handling for other instructions change
  const handleOtherInstructionsChange = (value: string) => {
    try {
      console.log('📝 Other instructions change:', value.length, 'characters')

      // Validate text length (reasonable limit)
      const maxLength = 1000
      if (value.length > maxLength) {
        throw new Error(`Text too long: ${value.length} characters (max: ${maxLength})`)
      }

      onOtherInstructionsChange(value)
    } catch (error) {
      const textError = error instanceof Error ? error : new Error('Unknown error in other instructions change')
      console.error('❌ Error changing other instructions:', textError)
      reportClientError(textError, `Other instructions change - Length: ${value.length}`)

      // Show user-friendly error message
      alert('その他の指定事項の変更に失敗しました。文字数を確認して再試行してください。')
    }
  }
  return (
    <Card role="region" aria-labelledby="generation-settings-title" data-tutorial="additional-options">
      <CardHeader>
        <CardTitle id="generation-settings-title">追加設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sideBySide"
            checked={layoutSideBySide}
            onCheckedChange={handleLayoutSideBySideChange}
            aria-describedby="sideBySide-description"
          />
          <Label htmlFor="sideBySide" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            正面と横の写真を並べる
          </Label>
          <ScreenReaderOnly id="sideBySide-description">
            チェックすると背景色選択と横の写真アップロードが有効になります
          </ScreenReaderOnly>
        </div>
        
        {layoutSideBySide && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label id="bg-color-label">背景色</Label>
              <RadioGroup
                value={backgroundColor}
                onValueChange={handleBackgroundColorChange}
                aria-labelledby="bg-color-label"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="白" id="bg-white" />
                  <Label htmlFor="bg-white" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white border border-gray-300 rounded" />
                      <span>白</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="黒" id="bg-black" />
                  <Label htmlFor="bg-black" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-black border border-gray-300 rounded" />
                      <span>黒</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="薄ピンク" id="bg-pink" />
                  <Label htmlFor="bg-pink" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-pink-100 border border-gray-300 rounded" />
                      <span>薄ピンク</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <ImageUpload
              label="横から見た建物の写真"
              onChange={handleSideImageChange}
              helperText="正面と横の写真を並べるために使用されます"
              required
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="otherInstructions">その他の指定</Label>
          <Textarea
            id="otherInstructions"
            placeholder={`追加の指示や要望があれば入力してください
例:ベランダの壁だけを黒に変えてください。`}
            value={otherInstructions}
            onChange={(e) => handleOtherInstructionsChange(e.target.value)}
            aria-describedby="otherInstructions-help"
            aria-label="その他の指定事項"
            className="min-h-[100px]"
          />
          <ScreenReaderOnly id="otherInstructions-help">
            画像生成時に追加で考慮してほしい指示や要望を自由に入力できます
          </ScreenReaderOnly>
        </div>
      </CardContent>
    </Card>
  )
}