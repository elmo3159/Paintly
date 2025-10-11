'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  colorCategories,
  getWebColorById,
  type WebColor,
  type ColorCategory
} from '@/lib/web-colors'
import { X } from 'lucide-react'

interface WebColorSelectorProps {
  label: string
  selectedColorId?: string
  onColorSelect: (colorId: string) => void
  disabled?: boolean
  recentColors?: string[]
}

export function WebColorSelector({
  label,
  selectedColorId,
  onColorSelect,
  disabled = false,
  recentColors = []
}: WebColorSelectorProps) {
  const safeSelectedColorId = selectedColorId === '' ? undefined : selectedColorId
  const [selectedCategory, setSelectedCategory] = useState<string>('none')
  const [availableColors, setAvailableColors] = useState<WebColor[]>([])

  // 選択された色IDに基づいて初期状態を設定
  useEffect(() => {
    if (safeSelectedColorId && safeSelectedColorId !== 'no-change') {
      const color = getWebColorById(safeSelectedColorId)
      if (color) {
        // カテゴリを見つける
        const category = colorCategories.find(cat =>
          cat.colors.some(c => c.id === safeSelectedColorId)
        )
        if (category) {
          setSelectedCategory(category.name)
          setAvailableColors(category.colors)
        }
      }
    }
  }, [safeSelectedColorId])

  // カテゴリ変更時の処理
  const handleCategoryChange = (categoryName: string) => {
    if (categoryName === 'none') {
      handleReset()
      return
    }

    setSelectedCategory(categoryName)
    onColorSelect('no-change')

    const category = colorCategories.find(c => c.name === categoryName)
    if (category) {
      setAvailableColors(category.colors)
    }
  }

  // 色変更時の処理
  const handleColorChange = (colorId: string) => {
    if (colorId === 'none') {
      onColorSelect('no-change')
      return
    }

    if (colorId !== 'no-change') {
      const color = getWebColorById(colorId)
      if (!color) {
        console.error('Color not found:', colorId)
        return
      }
    }

    onColorSelect(colorId)
  }

  // リセット処理
  const handleReset = () => {
    setSelectedCategory('none')
    setAvailableColors([])
    onColorSelect('no-change')
  }

  // 選択された色を取得
  const selectedColor = safeSelectedColorId ? getWebColorById(safeSelectedColorId) : null

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
    <div className="space-y-3" role="region" aria-labelledby={`${label}-heading`}>
      <div className="flex items-center justify-between">
        <label id={`${label}-heading`} className="text-sm font-medium">{label}</label>
        {selectedColor && selectedColor.id !== 'no-change' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-6 px-2"
            aria-label={`${label}の選択をリセット`}
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

              const isSelected = safeSelectedColorId === colorId

              return (
                <button
                  key={colorId}
                  onClick={() => handleColorChange(colorId)}
                  className={`group relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.japaneseName} (${color.englishName})`}
                  aria-label={`${color.japaneseName}を選択`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 選択済みの色を表示 */}
      {selectedColor && selectedColor.id !== 'no-change' && (
        <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-md border">
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
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* カテゴリ選択 */}
        <Select value={selectedCategory || 'none'} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="変更なし - カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">変更なし</SelectItem>
            {colorCategories.map((category) => {
              // カテゴリの代表色（最初の色）を取得
              const representativeColor = category.colors[0]
              return (
                <SelectItem key={category.name} value={category.name}>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: representativeColor.hex }}
                    />
                    <span>{category.name} ({category.count}色)</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* 色選択 */}
        {selectedCategory && selectedCategory !== 'none' && availableColors.length > 0 && (
          <Select value={safeSelectedColorId || 'none'} onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="色を選択" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="none">色を選択しない</SelectItem>
              {availableColors.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  <div className="flex items-center space-x-3 py-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{color.japaneseName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="truncate">{color.englishName}</span>
                        <span className="text-gray-400 flex-shrink-0">{color.hex}</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
