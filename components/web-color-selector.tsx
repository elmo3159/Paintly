'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  colorCategories,
  getWebColorById,
  type WebColor,
} from '@/lib/web-colors'

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
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 選択された色を取得
  const selectedColor = safeSelectedColorId ? getWebColorById(safeSelectedColorId) : null

  // 選択された色のカテゴリーを自動選択
  useEffect(() => {
    if (safeSelectedColorId && safeSelectedColorId !== 'no-change') {
      const color = getWebColorById(safeSelectedColorId)
      if (color) {
        const category = colorCategories.find(cat =>
          cat.colors.some(c => c.id === safeSelectedColorId)
        )
        if (category) {
          setSelectedCategory(category.name)
        }
      }
    }
  }, [safeSelectedColorId])

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 色選択時の処理
  const handleColorSelect = (colorId: string) => {
    onColorSelect(colorId)
    setIsOpen(false) // ドロップダウンを閉じる
  }

  // リセット処理
  const handleReset = () => {
    setSelectedCategory('')
    onColorSelect('no-change')
  }

  // カテゴリーのボタンをクリックした時の処理
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  // 現在選択されているカテゴリーの色を取得
  const currentColors = selectedCategory
    ? colorCategories.find(cat => cat.name === selectedCategory)?.colors || []
    : []

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
    <div className="space-y-3 relative" role="region" aria-labelledby={`${label}-heading`} ref={dropdownRef}>
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
                  onClick={() => handleColorSelect(colorId)}
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

      {/* 統合されたカラーピッカー */}
      <div>
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`${label}を選択`}
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {selectedColor && selectedColor.id !== 'no-change'
              ? selectedColor.japaneseName
              : '変更なし - 色を選択'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
          )}
        </Button>

        {/* ドロップダウンコンテンツ */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-[70dvh] overflow-hidden flex flex-col">
              {/* カテゴリー横スクロール */}
              <div className="border-b bg-gray-50 dark:bg-gray-800">
                <div
                  ref={categoryScrollRef}
                  className="flex overflow-x-auto gap-2 p-3"
                  style={{
                    scrollbarWidth: 'thin',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {colorCategories.map((category) => {
                    const isSelected = selectedCategory === category.name
                    const representativeColor = category.colors[0]

                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 whitespace-nowrap transition-all flex-shrink-0 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: representativeColor.hex }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 色グリッド（3列） */}
              <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(70dvh - 60px)' }}>
                {currentColors.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {currentColors.map((color) => {
                      const isSelected = safeSelectedColorId === color.id

                      return (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(color.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:shadow-md active:scale-95 ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                        >
                          {/* 色プレビュー（縦幅短め） */}
                          <div
                            className="w-full h-8 rounded-md border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color.hex }}
                          />
                          {/* 色名（折り返し） */}
                          <div className="w-full text-center">
                            <div className="text-xs font-medium leading-tight line-clamp-2">
                              {color.japaneseName}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    カテゴリーを選択してください
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
