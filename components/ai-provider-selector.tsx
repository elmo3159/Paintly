'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Info,
  Sparkles,
  Clock,
  DollarSign
} from 'lucide-react'

export type ProviderType = 'fal-ai' | 'gemini'

export interface ProviderConfig {
  type: ProviderType
  displayName: string
  enabled: boolean
  description: string
  features: string[]
  limitations?: string[]
}

interface AIProviderSelectorProps {
  selectedProvider: ProviderType
  onProviderChange: (provider: ProviderType) => void
  availableProviders: ProviderConfig[]
  disabled?: boolean
  className?: string
}

export function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  availableProviders = [],
  disabled = false,
  className = ''
}: AIProviderSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)

  // 安全性チェック
  const safeAvailableProviders = Array.isArray(availableProviders) ? availableProviders : []

  const getProviderIcon = (type: ProviderType) => {
    switch (type) {
      case 'fal-ai':
        return <Zap className="h-5 w-5 text-blue-600" />
      case 'gemini':
        return <Brain className="h-5 w-5 text-green-600" />
      default:
        return <Sparkles className="h-5 w-5 text-gray-500" />
    }
  }

  const handleProviderChange = async (provider: ProviderType) => {
    if (disabled || provider === selectedProvider) return

    setIsLoading(true)
    try {
      // プロバイダー切り替えのフィードバック
      await new Promise(resolve => setTimeout(resolve, 300))
      onProviderChange(provider)
    } finally {
      setIsLoading(false)
    }
  }

  if (safeAvailableProviders.length === 0) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          利用可能なAIプロバイダーがありません。環境変数を確認してください。
        </AlertDescription>
      </Alert>
    )
  }

  if (safeAvailableProviders.length === 1) {
    const provider = safeAvailableProviders[0]
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getProviderIcon(provider.type)}
            <CardTitle className="text-lg text-blue-900">
              {provider.displayName}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              使用中
            </Badge>
          </div>
          <CardDescription className="text-blue-700">
            {provider.description}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={`overflow-y-auto ${className}`} style={{ maxHeight: '384px' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AIプロバイダー選択
        </CardTitle>
        <CardDescription>
          画像生成に使用するAIモデルを選択してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedProvider}
          onValueChange={handleProviderChange}
          disabled={disabled || isLoading}
          className="space-y-4"
        >
          {safeAvailableProviders.map((provider) => (
            <div key={provider.type} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value={provider.type}
                  id={provider.type}
                  disabled={!provider.enabled || disabled || isLoading}
                />
                <Label
                  htmlFor={provider.type}
                  className={`flex-1 cursor-pointer ${
                    !provider.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getProviderIcon(provider.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.displayName}</span>
                        {provider.enabled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {selectedProvider === provider.type && (
                          <Badge variant="default" className="text-xs">
                            使用中
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              {/* 機能と制限の詳細表示 */}
              {provider.enabled && (
                <div className="ml-6 space-y-2">
                  {/* 機能 */}
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">特徴</h4>
                    <div className="flex flex-wrap gap-1">
                      {provider.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-green-50 border-green-200 text-green-700"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 制限 */}
                  {provider.limitations && provider.limitations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-700 mb-1">制限事項</h4>
                      <div className="flex flex-wrap gap-1">
                        {provider.limitations.map((limitation, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-orange-50 border-orange-200 text-orange-700"
                          >
                            {limitation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!provider.enabled && (
                <div className="ml-6">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      このプロバイダーは設定が不完全または無効です
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>

        {/* 追加情報 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">プロバイダーについて</p>
              <ul className="space-y-1 text-xs">
                <li>• プロバイダーはリアルタイムで切り替え可能です</li>
                <li>• 生成品質や速度は選択したプロバイダーによって異なります</li>
                <li>• 設定は自動的に保存されます</li>
              </ul>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600">切り替え中...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// フック：AIプロバイダー管理
export function useAIProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('fal-ai')
  const [availableProviders, setAvailableProviders] = useState<ProviderConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableProviders()
  }, [])

  const fetchAvailableProviders = async () => {
    try {
      const response = await fetch('/api/ai-providers')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [AIProviderSelector] Fetched providers:', data)

        if (data.success && Array.isArray(data.providers) && data.providers.length > 0) {
          setAvailableProviders(data.providers)
          setSelectedProvider(data.currentProvider || 'fal-ai')
          console.log(`📍 [AIProviderSelector] Set ${data.providers.length} providers, current: ${data.currentProvider}`)
        } else {
          console.warn('⚠️ [AIProviderSelector] No providers available in response:', data)
          setAvailableProviders([])
        }
      } else {
        console.error('❌ [AIProviderSelector] API failed with status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
        setAvailableProviders([])
      }
    } catch (error) {
      console.error('❌ [AIProviderSelector] Failed to fetch AI providers:', error)
      setAvailableProviders([])
    } finally {
      setIsLoading(false)
    }
  }

  const changeProvider = async (provider: ProviderType) => {
    try {
      const response = await fetch('/api/ai-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider })
      })

      if (response.ok) {
        setSelectedProvider(provider)
        return true
      } else {
        throw new Error('Failed to change provider')
      }
    } catch (error) {
      console.error('Failed to change provider:', error)
      return false
    }
  }

  return {
    selectedProvider,
    availableProviders,
    isLoading,
    changeProvider,
    refreshProviders: fetchAvailableProviders
  }
}