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
          component: 'CompactColorSelector'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

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
    try {
      console.log('🔄 Initializing color selector state:', { safeSelectedColorId, usage, label })

      if (safeSelectedColorId && safeSelectedColorId !== 'no-change') {
        // Validate color ID format
        if (typeof safeSelectedColorId !== 'string') {
          throw new Error(`Invalid color ID type: ${typeof safeSelectedColorId}`)
        }

        const color = getColorById(safeSelectedColorId)
        if (!color) {
          console.warn('⚠️ Color not found for ID:', safeSelectedColorId)
          return
        }

        console.log('✅ Found color:', color.name, color.code)

        // カテゴリとサブカテゴリを見つける
        let found = false
        for (const category of colorHierarchy) {
          if (!category || !Array.isArray(category.subcategories)) {
            console.warn('⚠️ Invalid category structure:', category)
            continue
          }

          for (const subcategory of category.subcategories) {
            if (!subcategory || !Array.isArray(subcategory.colors)) {
              console.warn('⚠️ Invalid subcategory structure:', subcategory)
              continue
            }

            if (subcategory.colors.some(c => c?.id === safeSelectedColorId)) {
              console.log('✅ Found category and subcategory:', category.name, subcategory.name)

              setSelectedCategory(category.id)
              setSelectedSubcategory(subcategory.id)
              setAvailableSubcategories(category.subcategories)
              setAvailableColors(subcategory.colors)
              found = true
              return
            }
          }
        }

        if (!found) {
          console.warn('⚠️ Category/subcategory not found for color ID:', safeSelectedColorId)
        }
      }
    } catch (error) {
      const initError = error instanceof Error ? error : new Error('Unknown error in color selector initialization')
      console.error('❌ Error initializing color selector:', initError)
      reportClientError(initError, `Color selector initialization - ColorID: ${safeSelectedColorId}, Usage: ${usage}`)

      // Reset to safe state on error
      setSelectedCategory('none')
      setSelectedSubcategory('none')
      setAvailableSubcategories([])
      setAvailableColors([])
    }
  }, [safeSelectedColorId, usage, label])

  // カテゴリ変更時の処理
  const handleCategoryChange = (categoryId: string) => {
    try {
      console.log('🎨 [CompactColorSelector] Category changed:', categoryId)
      console.log('🎨 Available categories:', availableCategories.length)

      // Validate categoryId
      if (typeof categoryId !== 'string') {
        throw new Error(`Invalid category ID type: ${typeof categoryId}`)
      }

      if (categoryId === 'none') {
        handleReset()
        return
      }

      // Validate onColorSelect function
      if (typeof onColorSelect !== 'function') {
        throw new Error(`onColorSelect is not a function: ${typeof onColorSelect}`)
      }

      setSelectedCategory(categoryId)
      setSelectedSubcategory('none')

      // カテゴリ選択時は「変更なし」状態にリセット
      onColorSelect('no-change')

      // Validate availableCategories
      if (!Array.isArray(availableCategories)) {
        throw new Error('Available categories is not an array')
      }

      const category = availableCategories.find(c => c?.id === categoryId)
      if (!category) {
        throw new Error(`Category not found: ${categoryId}`)
      }

      console.log('✅ Found category:', category.name)

      // Validate category structure
      if (!Array.isArray(category.subcategories)) {
        throw new Error(`Category subcategories is not an array: ${typeof category.subcategories}`)
      }

      setAvailableSubcategories(category.subcategories)
      setAvailableColors([])
      console.log('✅ Set subcategories:', category.subcategories.length)

    } catch (error) {
      const categoryError = error instanceof Error ? error : new Error('Unknown error in handleCategoryChange')
      console.error('❌ Error in category change:', categoryError)
      reportClientError(categoryError, `Category change - CategoryID: ${categoryId}, Usage: ${usage}`)

      // Show user-friendly error message
      alert('カテゴリの変更に失敗しました。再試行してください。')

      // Reset to safe state
      try {
        setSelectedCategory('none')
        setSelectedSubcategory('none')
        setAvailableSubcategories([])
        setAvailableColors([])
        if (typeof onColorSelect === 'function') {
          onColorSelect('no-change')
        }
      } catch (resetError) {
        console.error('❌ Error during error recovery reset:', resetError)
      }
    }
  }

  // サブカテゴリ変更時の処理
  const handleSubcategoryChange = (subcategoryId: string) => {
    try {
      console.log('🎨 [CompactColorSelector] Subcategory changed:', subcategoryId)

      // Validate subcategoryId
      if (typeof subcategoryId !== 'string') {
        throw new Error(`Invalid subcategory ID type: ${typeof subcategoryId}`)
      }

      if (subcategoryId === 'none') {
        console.log('✅ Resetting subcategory selection')
        setSelectedSubcategory('none')
        setAvailableColors([])
        if (typeof onColorSelect === 'function') {
          onColorSelect('no-change')
        }
        return
      }

      // Validate onColorSelect function
      if (typeof onColorSelect !== 'function') {
        throw new Error(`onColorSelect is not a function: ${typeof onColorSelect}`)
      }

      setSelectedSubcategory(subcategoryId)
      onColorSelect('no-change') // 色選択をリセット

      // Validate availableSubcategories
      if (!Array.isArray(availableSubcategories)) {
        throw new Error('Available subcategories is not an array')
      }

      const subcategory = availableSubcategories.find(s => s?.id === subcategoryId)
      if (!subcategory) {
        throw new Error(`Subcategory not found: ${subcategoryId}`)
      }

      console.log('✅ Found subcategory:', subcategory.name)

      // Validate subcategory structure
      if (!Array.isArray(subcategory.colors)) {
        throw new Error(`Subcategory colors is not an array: ${typeof subcategory.colors}`)
      }

      setAvailableColors(subcategory.colors)
      console.log('✅ Set colors:', subcategory.colors.length)

    } catch (error) {
      const subcategoryError = error instanceof Error ? error : new Error('Unknown error in handleSubcategoryChange')
      console.error('❌ Error in subcategory change:', subcategoryError)
      reportClientError(subcategoryError, `Subcategory change - SubcategoryID: ${subcategoryId}, Usage: ${usage}`)

      // Show user-friendly error message
      alert('サブカテゴリの変更に失敗しました。再試行してください。')

      // Reset to safe state
      try {
        setSelectedSubcategory('none')
        setAvailableColors([])
        if (typeof onColorSelect === 'function') {
          onColorSelect('no-change')
        }
      } catch (resetError) {
        console.error('❌ Error during subcategory error recovery reset:', resetError)
      }
    }
  }

  // 色変更時の処理
  const handleColorChange = (colorId: string) => {
    try {
      console.log('🎨 [CompactColorSelector] Color changed:', colorId)

      // Validate colorId
      if (typeof colorId !== 'string') {
        throw new Error(`Invalid color ID type: ${typeof colorId}`)
      }

      // Validate onColorSelect function
      if (typeof onColorSelect !== 'function') {
        throw new Error(`onColorSelect is not a function: ${typeof onColorSelect}`)
      }

      if (colorId === 'none') {
        console.log('✅ Resetting color selection')
        onColorSelect('no-change')
        return
      }

      // Validate that the color exists if not 'no-change'
      if (colorId !== 'no-change') {
        const color = getColorById(colorId)
        if (!color) {
          throw new Error(`Color not found for ID: ${colorId}`)
        }
        console.log('✅ Selected color:', color.name, color.code)
      }

      onColorSelect(colorId)
      console.log('✅ Color selection completed:', colorId)

    } catch (error) {
      const colorError = error instanceof Error ? error : new Error('Unknown error in handleColorChange')
      console.error('❌ Error in color change:', colorError)
      reportClientError(colorError, `Color change - ColorID: ${colorId}, Usage: ${usage}`)

      // Show user-friendly error message
      alert('色の変更に失敗しました。再試行してください。')

      // Reset to safe state
      try {
        if (typeof onColorSelect === 'function') {
          onColorSelect('no-change')
        }
      } catch (resetError) {
        console.error('❌ Error during color error recovery reset:', resetError)
      }
    }
  }

  // リセット処理
  const handleReset = () => {
    try {
      console.log('🔄 [CompactColorSelector] Resetting color selector')

      // Validate onColorSelect function before proceeding
      if (typeof onColorSelect !== 'function') {
        throw new Error(`onColorSelect is not a function: ${typeof onColorSelect}`)
      }

      // Reset all state variables to safe defaults
      setSelectedCategory('none')
      setSelectedSubcategory('none')
      setAvailableSubcategories([])
      setAvailableColors([])
      onColorSelect('no-change')

      console.log('✅ Color selector reset completed')

    } catch (error) {
      const resetError = error instanceof Error ? error : new Error('Unknown error in handleReset')
      console.error('❌ Error in reset:', resetError)
      reportClientError(resetError, `Color selector reset - Usage: ${usage}`)

      // Show user-friendly error message
      alert('リセット処理に失敗しました。ページを再読み込みしてください。')

      // Force reset to safe state even if there was an error
      try {
        setSelectedCategory('none')
        setSelectedSubcategory('none')
        setAvailableSubcategories([])
        setAvailableColors([])

        // Only call onColorSelect if it's a function
        if (typeof onColorSelect === 'function') {
          onColorSelect('no-change')
        }
      } catch (forceResetError) {
        console.error('❌ Error during force reset:', forceResetError)
        // Last resort: recommend page reload to user
        alert('重大なエラーが発生しました。ページを再読み込みしてください。')
      }
    }
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
    <div className="space-y-3" role="region" aria-labelledby={`${label}-heading`}>
      <div className="flex items-center justify-between">
        <label id={`${label}-heading`} className="text-sm font-medium">{label}</label>
        {selectedColor && (
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