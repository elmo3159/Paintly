/**
 * AIプロバイダーマネージャー
 * プロバイダーの管理、切り替え、設定を統一的に処理
 */

import { AIProvider, GenerationParams, GenerationResult } from './types'
import { FalAIProvider } from './fal-provider'
import { GeminiProvider } from './gemini-provider'

export type ProviderType = 'fal-ai' | 'gemini'

export interface ProviderConfig {
  type: ProviderType
  displayName: string
  enabled: boolean
  description: string
  features: string[]
  limitations?: string[]
}

export class AIProviderManager {
  private providers: Map<ProviderType, AIProvider> = new Map()
  private currentProvider: ProviderType = 'fal-ai' // デフォルトはFal AI

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // 環境変数からAPIキーを取得
    const falApiKey = process.env.FAL_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY

    // Fal AIプロバイダー
    if (falApiKey) {
      try {
        const falProvider = new FalAIProvider(falApiKey)
        this.providers.set('fal-ai', falProvider)
        console.log('✅ [ProviderManager] Fal AI provider initialized')
      } catch (error) {
        console.error('❌ [ProviderManager] Failed to initialize Fal AI provider:', error)
      }
    } else {
      console.warn('⚠️ [ProviderManager] FAL_KEY not found, Fal AI provider disabled')
    }

    // Geminiプロバイダー
    if (geminiApiKey) {
      try {
        const geminiProvider = new GeminiProvider(geminiApiKey)
        this.providers.set('gemini', geminiProvider)
        console.log('✅ [ProviderManager] Gemini provider initialized')
      } catch (error) {
        console.error('❌ [ProviderManager] Failed to initialize Gemini provider:', error)
      }
    } else {
      console.warn('⚠️ [ProviderManager] GEMINI_API_KEY not found, Gemini provider disabled')
    }

    // 現在のプロバイダーが利用可能かチェック
    if (!this.providers.has(this.currentProvider)) {
      // フォールバック: 利用可能な最初のプロバイダーを使用
      const availableProviders = Array.from(this.providers.keys())
      if (availableProviders.length > 0) {
        this.currentProvider = availableProviders[0]
        console.log(`📍 [ProviderManager] Fallback to available provider: ${this.currentProvider}`)
      } else {
        console.error('❌ [ProviderManager] No providers available!')
      }
    }
  }

  /**
   * 利用可能なプロバイダー一覧を取得
   */
  getAvailableProviders(): ProviderConfig[] {
    const configs: ProviderConfig[] = [
      {
        type: 'fal-ai',
        displayName: 'Fal AI (Seedream 4.0)',
        enabled: this.providers.has('fal-ai'),
        description: '高品質な画像生成に最適化されたAIモデル',
        features: [
          '高解像度出力 (1024x1024)',
          '高速生成 (平均30-60秒)',
          '写実的な仕上がり',
          '建築物の細部表現に優れている'
        ],
        limitations: [
          '月額利用料金が発生',
          'インターネット接続必須'
        ]
      },
      {
        type: 'gemini',
        displayName: 'Google Gemini 2.5 Flash',
        enabled: this.providers.has('gemini'),
        description: 'Googleの最新マルチモーダルAIモデル',
        features: [
          '多言語対応',
          '高度な画像理解',
          '無料利用枠あり',
          'リアルタイム生成'
        ],
        limitations: [
          '生成品質がやや不安定',
          'プレビュー版のため制限あり'
        ]
      }
    ]

    return configs.filter(config => config.enabled)
  }

  /**
   * 現在のプロバイダーを取得
   */
  getCurrentProvider(): ProviderType {
    return this.currentProvider
  }

  /**
   * プロバイダーを切り替え
   */
  setCurrentProvider(providerType: ProviderType): boolean {
    if (!this.providers.has(providerType)) {
      console.error(`❌ [ProviderManager] Provider '${providerType}' is not available`)
      return false
    }

    const provider = this.providers.get(providerType)!
    if (!provider.isEnabled()) {
      console.error(`❌ [ProviderManager] Provider '${providerType}' is not enabled`)
      return false
    }

    this.currentProvider = providerType
    console.log(`✅ [ProviderManager] Switched to provider: ${providerType}`)
    return true
  }

  /**
   * 現在のプロバイダー設定を取得
   */
  getCurrentProviderConfig(): ProviderConfig | null {
    const configs = this.getAvailableProviders()
    return configs.find(config => config.type === this.currentProvider) || null
  }

  /**
   * 画像生成を実行
   */
  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    const provider = this.providers.get(this.currentProvider)
    
    if (!provider) {
      return {
        success: false,
        error: `プロバイダー '${this.currentProvider}' が利用できません`,
        metadata: {
          provider: this.currentProvider,
          model: 'unknown',
          prompt: ''
        }
      }
    }

    if (!provider.isEnabled()) {
      return {
        success: false,
        error: `プロバイダー '${this.currentProvider}' が有効ではありません`,
        metadata: {
          provider: this.currentProvider,
          model: 'unknown',
          prompt: ''
        }
      }
    }

    console.log(`🚀 [ProviderManager] Generating image with provider: ${this.currentProvider}`)
    
    try {
      const result = await provider.generateImage(params)
      console.log(`✅ [ProviderManager] Generation completed. Success: ${result.success}`)
      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`❌ [ProviderManager] Generation failed:`, errorMessage)
      return {
        success: false,
        error: errorMessage || '画像生成に失敗しました',
        metadata: {
          provider: this.currentProvider,
          model: provider.getName(),
          prompt: provider.buildPrompt(params)
        }
      }
    }
  }

  /**
   * プロバイダーのヘルスチェック
   */
  async healthCheck(): Promise<Record<ProviderType, boolean>> {
    const health: Record<string, boolean> = {}
    
    for (const [type, provider] of this.providers) {
      try {
        health[type] = provider.isEnabled() && provider.validateConfig()
      } catch (error) {
        health[type] = false
        console.error(`❌ [ProviderManager] Health check failed for ${type}:`, error)
      }
    }
    
    return health as Record<ProviderType, boolean>
  }

  /**
   * プロンプトのプレビューを生成（デバッグ用）
   */
  buildPromptPreview(params: GenerationParams): string {
    const provider = this.providers.get(this.currentProvider)
    
    if (!provider) {
      return `プロバイダー '${this.currentProvider}' が利用できません`
    }

    return provider.buildPrompt(params)
  }
}

// シングルトンインスタンス
let providerManagerInstance: AIProviderManager | null = null

export function getProviderManager(): AIProviderManager {
  if (!providerManagerInstance) {
    providerManagerInstance = new AIProviderManager()
  }
  return providerManagerInstance
}

// サーバーサイド用の初期化関数
export function initializeProviderManager(): AIProviderManager {
  console.log('🔧 [ProviderManager] Initializing provider manager...')
  const manager = getProviderManager()
  
  // 利用可能なプロバイダーをログ出力
  const availableProviders = manager.getAvailableProviders()
  console.log('📋 [ProviderManager] Available providers:', availableProviders.map(p => p.type))
  console.log('📍 [ProviderManager] Current provider:', manager.getCurrentProvider())
  
  return manager
}