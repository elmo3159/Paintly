'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  colorHierarchy,
  getRecommendedColorsForUsage,
  getColorById,
  type ColorCategory,
  type ColorSubcategory,
  type PaintColor,
  type ColorUsage
} from '@/lib/hierarchical-paint-colors'
import { ArrowLeft, Palette, Check, ChevronRight } from 'lucide-react'

interface HierarchicalColorSelectorProps {
  usage: ColorUsage
  label: string
  selectedColorId?: string
  onColorSelect: (colorId: string) => void
  disabled?: boolean
}

type SelectionStep = 'category' | 'subcategory' | 'color'

export function HierarchicalColorSelector({
  usage,
  label,
  selectedColorId,
  onColorSelect,
  disabled = false
}: HierarchicalColorSelectorProps) {
  const [currentStep, setCurrentStep] = useState<SelectionStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<ColorCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<ColorSubcategory | null>(null)
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null)

  // 用途に応じた推奨カテゴリを取得
  const availableCategories = getRecommendedColorsForUsage(usage)

  // 選択された色IDに基づいて初期状態を設定
  useEffect(() => {
    if (selectedColorId) {
      const color = getColorById(selectedColorId)
      if (color) {
        setSelectedColor(color)
        // カテゴリとサブカテゴリを見つける
        for (const category of colorHierarchy) {
          for (const subcategory of category.subcategories) {
            if (subcategory.colors.some(c => c.id === selectedColorId)) {
              setSelectedCategory(category)
              setSelectedSubcategory(subcategory)
              break
            }
          }
        }
      }
    }
  }, [selectedColorId])

  const handleCategorySelect = (category: ColorCategory) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    setSelectedColor(null)
    setCurrentStep('subcategory')
  }

  const handleSubcategorySelect = (subcategory: ColorSubcategory) => {
    setSelectedSubcategory(subcategory)
    setSelectedColor(null)
    setCurrentStep('color')
  }

  const handleColorSelect = (color: PaintColor) => {
    setSelectedColor(color)
    onColorSelect(color.id)
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'subcategory':
        setCurrentStep('category')
        setSelectedCategory(null)
        break
      case 'color':
        setCurrentStep('subcategory')
        setSelectedSubcategory(null)
        break
    }
  }

  const handleReset = () => {
    setCurrentStep('category')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSelectedColor(null)
    onColorSelect('')
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedColor && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            リセット
          </Button>
        )}
      </div>

      {/* 選択済みの色を表示 */}
      {selectedColor && (
        <Card className="border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">{selectedColor.name}</div>
                <div className="text-xs text-gray-500">
                  {selectedColor.code} • {selectedColor.hex}
                </div>
              </div>
              <Check className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* パンくずナビゲーション */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span className={currentStep === 'category' ? 'text-primary font-medium' : ''}>
          カテゴリ選択
        </span>
        {(currentStep === 'subcategory' || currentStep === 'color') && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className={currentStep === 'subcategory' ? 'text-primary font-medium' : ''}>
              サブカテゴリ選択
            </span>
          </>
        )}
        {currentStep === 'color' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">色選択</span>
          </>
        )}
      </div>

      {/* メインコンテンツ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>
                {currentStep === 'category' && 'カテゴリを選択'}
                {currentStep === 'subcategory' && 'サブカテゴリを選択'}
                {currentStep === 'color' && '色を選択'}
              </span>
            </CardTitle>
            {currentStep !== 'category' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                戻る
              </Button>
            )}
          </div>
          {currentStep === 'subcategory' && selectedCategory && (
            <p className="text-sm text-gray-600">
              {selectedCategory.name}: {selectedCategory.description}
            </p>
          )}
          {currentStep === 'color' && selectedSubcategory && (
            <p className="text-sm text-gray-600">
              {selectedSubcategory.name}の色一覧
            </p>
          )}
        </CardHeader>

        <CardContent>
          {/* カテゴリ選択 */}
          {currentStep === 'category' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => handleCategorySelect(category)}
                  className="h-auto p-4 text-left justify-start hover:bg-primary/5"
                >
                  <div className="flex items-start space-x-3 w-full">
                    {/* カテゴリ代表色を表示 */}
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0 mt-1"
                      style={{ backgroundColor: category.hex }}
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {category.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.subcategories.slice(0, 3).map((sub) => (
                          <Badge key={sub.id} variant="secondary" className="text-xs">
                            {sub.name}
                          </Badge>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{category.subcategories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* サブカテゴリ選択 */}
          {currentStep === 'subcategory' && selectedCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCategory.subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant="outline"
                  onClick={() => handleSubcategorySelect(subcategory)}
                  className="h-auto p-4 text-left justify-start hover:bg-primary/5"
                >
                  <div className="space-y-2">
                    <div className="font-semibold">{subcategory.name}</div>
                    <div className="flex space-x-1">
                      {subcategory.colors.slice(0, 6).map((color) => (
                        <div
                          key={color.id}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                      {subcategory.colors.length > 6 && (
                        <div className="text-xs text-gray-500 self-center ml-1">
                          +{subcategory.colors.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* 色選択 */}
          {currentStep === 'color' && selectedSubcategory && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedSubcategory.colors.map((color) => (
                <Button
                  key={color.id}
                  variant={selectedColor?.id === color.id ? "default" : "outline"}
                  onClick={() => handleColorSelect(color)}
                  className="h-auto p-3 text-left justify-start hover:bg-primary/5"
                >
                  <div className="space-y-2 w-full">
                    <div
                      className="w-full h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-semibold leading-tight">
                        {color.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {color.code}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}