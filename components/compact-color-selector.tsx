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
  colorHierarchy,
  getRecommendedColorsForUsage,
  getColorById,
  type ColorCategory,
  type ColorSubcategory,
  type PaintColor,
  type ColorUsage
} from '@/lib/hierarchical-paint-colors'
import { X } from 'lucide-react'

interface CompactColorSelectorProps {
  usage: ColorUsage
  label: string
  selectedColorId?: string
  onColorSelect: (colorId: string) => void
  disabled?: boolean
}

export function CompactColorSelector({
  usage,
  label,
  selectedColorId,
  onColorSelect,
  disabled = false
}: CompactColorSelectorProps) {
  // 空文字列の場合はundefinedに変換して安全性を確保
  const safeSelectedColorId = selectedColorId === '' ? undefined : selectedColorId
  const [selectedCategory, setSelectedCategory] = useState<string>('none')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('none')
  const [availableSubcategories, setAvailableSubcategories] = useState<ColorSubcategory[]>([])
  const [availableColors, setAvailableColors] = useState<PaintColor[]>([])

  // 用途に応じた推奨カテゴリを取得
  const availableCategories = getRecommendedColorsForUsage(usage)

  // 選択された色IDに基づいて初期状態を設定
  useEffect(() => {
    if (safeSelectedColorId && safeSelectedColorId !== 'no-change') {
      const color = getColorById(safeSelectedColorId)
      if (color) {
        // カテゴリとサブカテゴリを見つける
        for (const category of colorHierarchy) {
          for (const subcategory of category.subcategories) {
            if (subcategory.colors.some(c => c.id === safeSelectedColorId)) {
              setSelectedCategory(category.id)
              setSelectedSubcategory(subcategory.id)
              setAvailableSubcategories(category.subcategories)
              setAvailableColors(subcategory.colors)
              return
            }
          }
        }
      }
    }
  }, [safeSelectedColorId])

  // カテゴリ変更時の処理
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'none') {
      handleReset()
      return
    }
    
    setSelectedCategory(categoryId)
    setSelectedSubcategory('none')
    onColorSelect('no-change') // 色選択をリセット

    const category = availableCategories.find(c => c.id === categoryId)
    if (category) {
      setAvailableSubcategories(category.subcategories)
      setAvailableColors([])
    }
  }

  // サブカテゴリ変更時の処理
  const handleSubcategoryChange = (subcategoryId: string) => {
    if (subcategoryId === 'none') {
      setSelectedSubcategory('none')
      setAvailableColors([])
      onColorSelect('no-change')
      return
    }
    
    setSelectedSubcategory(subcategoryId)
    onColorSelect('no-change') // 色選択をリセット

    const subcategory = availableSubcategories.find(s => s.id === subcategoryId)
    if (subcategory) {
      setAvailableColors(subcategory.colors)
    }
  }

  // 色変更時の処理
  const handleColorChange = (colorId: string) => {
    if (colorId === 'none') {
      onColorSelect('no-change')
      return
    }
    onColorSelect(colorId)
  }

  // リセット処理
  const handleReset = () => {
    setSelectedCategory('none')
    setSelectedSubcategory('none')
    setAvailableSubcategories([])
    setAvailableColors([])
    onColorSelect('no-change')
  }

  // 選択された色を取得
  const selectedColor = safeSelectedColorId ? getColorById(safeSelectedColorId) : null

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
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedColor && (
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

      {/* 選択済みの色を表示 */}
      {selectedColor && (
        <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-md border">
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{selectedColor.name}</div>
            <div className="text-xs text-gray-500">
              {selectedColor.code}
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
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: category.hex }}
                  />
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* サブカテゴリ選択 */}
        {selectedCategory && selectedCategory !== 'none' && (
          <Select value={selectedSubcategory || 'none'} onValueChange={handleSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="サブカテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">サブカテゴリを選択しない</SelectItem>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {subcategory.colors.slice(0, 3).map((color) => (
                        <div
                          key={color.id}
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                      {subcategory.colors.length > 3 && (
                        <span className="text-xs text-gray-400">+{subcategory.colors.length - 3}</span>
                      )}
                    </div>
                    <span>{subcategory.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 色選択 */}
        {selectedSubcategory && selectedSubcategory !== 'none' && availableColors.length > 0 && (
          <Select value={safeSelectedColorId || 'none'} onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="色を選択" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="none">色を選択しない</SelectItem>
              {availableColors.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  <div className="flex items-center space-x-3 py-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{color.name}</span>
                      <span className="text-xs text-gray-500">{color.code}</span>
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