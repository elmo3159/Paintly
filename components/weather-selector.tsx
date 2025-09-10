'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react'

interface WeatherSelectorProps {
  value: string
  onChange: (value: string) => void
}

const weatherOptions = [
  { value: '晴れ', label: '晴れ', icon: Sun },
  { value: '曇り', label: '曇り', icon: Cloud },
  { value: '雨', label: '雨', icon: CloudRain },
  { value: '雪', label: '雪', icon: CloudSnow },
]

export function WeatherSelector({ value, onChange }: WeatherSelectorProps) {
  const selectedWeather = weatherOptions.find(w => w.value === value) || weatherOptions[0]
  const SelectedIcon = selectedWeather.icon

  return (
    <div className="space-y-2">
      <Label htmlFor="weather">天候</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="weather">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <SelectedIcon className="h-4 w-4" />
              <span>{selectedWeather.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {weatherOptions.map((weather) => {
            const Icon = weather.icon
            return (
              <SelectItem key={weather.value} value={weather.value}>
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{weather.label}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}