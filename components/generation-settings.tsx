'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface GenerationSettingsProps {
  layoutSideBySide: boolean
  setLayoutSideBySide: (value: boolean) => void
  backgroundColor: string
  setBackgroundColor: (value: string) => void
  showSideImage: boolean
}

export function GenerationSettings({
  layoutSideBySide,
  setLayoutSideBySide,
  backgroundColor,
  setBackgroundColor,
  showSideImage
}: GenerationSettingsProps) {
  return (
    <div className="space-y-4">
      {showSideImage && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sideBySide"
              checked={layoutSideBySide}
              onCheckedChange={setLayoutSideBySide}
            />
            <Label htmlFor="sideBySide" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              正面と横の写真を並べる
            </Label>
          </div>
          
          {layoutSideBySide && (
            <div className="ml-6 space-y-2">
              <Label>背景色</Label>
              <RadioGroup value={backgroundColor} onValueChange={setBackgroundColor}>
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
          )}
        </div>
      )}
    </div>
  )
}