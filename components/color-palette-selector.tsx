/**
 * カラーパレットセレクター
 * 既存のWebColorSelectorの機能（最近の色、リセット）を統合した新しいUI
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ColorPalette } from '@/components/color-palette'
import { getWebColorById, type WebColor } from '@/lib/web-colors'
import { cn } from '@/lib/utils'

interface ColorPaletteSelectorProps {
  label: string
  selectedColorId?: string
  onColorSelect: (colorId: string) => void
  disabled?: boolean
  recentColors?: string[]
}

export function ColorPaletteSelector({
  label,
  selectedColorId,
  onColorSelect,
  disabled = false,
  recentColors = []
}: ColorPaletteSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const selectedColor = selectedColorId ? getWebColorById(selectedColorId) : null

  const handleReset = () => {
    onColorSelect('no-change')
    setIsExpanded(false)
  }

  const handleColorSelect = (color: WebColor) => {
    onColorSelect(color.id)
    // モバイルUX向上：色選択後に自動でパレットを閉じる
    setIsExpanded(false)
  }

  if (disabled) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">{label}</label>
        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-400">
          選択不可
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedColor && selectedColor.id !== 'no-change' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-6 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            リセット
          </Button>
        )}
      </div>

      {/* 最近使った色 */}
      {recentColors.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">最近使った色</div>
          <div className="flex gap-2 flex-wrap">
            {recentColors.map(colorId => {
              const color = getWebColorById(colorId)
              if (!color) return null

              const isSelected = selectedColorId === colorId

              return (
                <motion.button
                  key={colorId}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onColorSelect(colorId)}
                  className={cn(
                    'group relative w-10 h-10 rounded-full border-2 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-gray-300 hover:border-primary'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.japaneseName} (${color.englishName})`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* 選択済みの色を表示 */}
      {selectedColor && selectedColor.id !== 'no-change' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center space-x-3 p-3 bg-primary/5 rounded-md border"
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{selectedColor.japaneseName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="truncate">{selectedColor.englishName}</span>
              <span className="text-gray-400 flex-shrink-0">{selectedColor.hex}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* カラーパレット展開ボタン */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span>カラーパレットから選択</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* カラーパレット */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border rounded-lg p-4 bg-white">
              <ColorPalette
                selectedColorId={selectedColorId}
                onColorSelect={handleColorSelect}
                showNoChange={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
