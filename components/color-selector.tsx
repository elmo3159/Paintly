'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { wallColors, roofColors, doorColors, type PaintColor } from '@/lib/paint-colors'

interface ColorSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'wall' | 'roof' | 'door'
}

export function ColorSelector({ label, value, onChange, type = 'wall' }: ColorSelectorProps) {
  // Select appropriate color palette based on type
  let colors: PaintColor[] = wallColors
  if (type === 'roof') colors = roofColors
  else if (type === 'door') colors = doorColors

  const selectedColor = colors.find(c => c.name === value) || colors[0]

  return (
    <div className="space-y-2">
      <Label htmlFor={`color-${type}`}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={`color-${type}`}>
          <SelectValue>
            <div className="flex items-center space-x-2">
              {selectedColor.hex && (
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedColor.hex }}
                />
              )}
              <span>{selectedColor.name}</span>
              {selectedColor.code && (
                <span className="text-sm text-muted-foreground">({selectedColor.code})</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color.id} value={color.name}>
              <div className="flex items-center space-x-3">
                {color.hex ? (
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">-</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{color.name}</span>
                  {color.code && (
                    <span className="text-xs text-muted-foreground">{color.code}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}