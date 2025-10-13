/**
 * カラーパレットコンポーネント
 * グリッド形式で色を表示し、バッジ付きで視覚的に選択できるUI
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { WebColor, colorCategories } from '@/lib/web-colors'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ColorPaletteProps {
  selectedColorId?: string
  onColorSelect: (color: WebColor) => void
  showNoChange?: boolean // 「変更なし」オプションを表示するか
}

export function ColorPalette({ selectedColorId, onColorSelect, showNoChange = true }: ColorPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string>('白系')

  // 「変更なし」オプション
  const noChangeColor: WebColor = {
    id: 'no-change',
    englishName: 'No Change',
    japaneseName: '変更なし',
    rgb: 'rgb(0, 0, 0)',
    hex: 'transparent',
    category: 'その他'
  }

  return (
    <div className="w-full">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        {/* カテゴリタブ - モバイルで横スクロール可能 */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full flex-nowrap gap-1 bg-white/50 backdrop-blur-sm p-2">
            {showNoChange && (
              <TabsTrigger value="その他" className="text-xs whitespace-nowrap flex-shrink-0">
                その他
              </TabsTrigger>
            )}
            {colorCategories.map((category) => (
              <TabsTrigger key={category.name} value={category.name} className="text-xs whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: category.colors[0]?.hex || '#ccc' }}
                />
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* 「変更なし」タブ */}
        {showNoChange && (
          <TabsContent value="その他">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ColorItem
                color={noChangeColor}
                isSelected={selectedColorId === 'no-change'}
                onSelect={onColorSelect}
              />
            </motion.div>
          </TabsContent>
        )}

        {/* 各カテゴリのカラーグリッド */}
        {colorCategories.map((category) => (
          <TabsContent key={category.name} value={category.name} className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3"
            >
              {category.colors.map((color) => (
                <ColorItem
                  key={color.id}
                  color={color}
                  isSelected={selectedColorId === color.id}
                  onSelect={onColorSelect}
                />
              ))}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// 個別の色アイテムコンポーネント
interface ColorItemProps {
  color: WebColor
  isSelected: boolean
  onSelect: (color: WebColor) => void
}

function ColorItem({ color, isSelected, onSelect }: ColorItemProps) {
  const isNoChange = color.id === 'no-change'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(color)}
      className={cn(
        'relative p-2 md:p-3 rounded-lg border-2 transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      {/* 選択チェックマーク */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}

      {/* カラーサンプル */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'w-full aspect-[2/1] rounded-md shadow-sm',
            isNoChange && 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
          )}
          style={!isNoChange ? { backgroundColor: color.hex } : undefined}
        >
          {isNoChange && (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
              変更なし
            </div>
          )}
        </div>

        {/* 色名 */}
        <div className="text-center w-full">
          <p className="text-xs font-medium text-gray-900 truncate">{color.japaneseName}</p>
          {!isNoChange && (
            <p className="text-[10px] text-gray-500 font-mono">{color.hex.toUpperCase()}</p>
          )}
        </div>
      </div>
    </motion.button>
  )
}
