/**
 * AIプロバイダー抽象化レイヤー - 型定義
 * Fal AIとGeminiの統一インターフェース
 */

export interface GenerationParams {
  // 画像データ
  mainImage: string // base64
  sideImage?: string // base64
  
  // 色選択
  wallColor: string
  roofColor: string
  doorColor: string
  wallColorData?: ColorData
  roofColorData?: ColorData
  doorColorData?: ColorData
  
  // 設定
  weather: string
  layoutSideBySide: boolean
  backgroundColor: string
  otherInstructions: string
  hasSideImage: boolean
}

export interface ColorData {
  name: string
  code: string
  hex: string
  rgb: { r: number; g: number; b: number }
  munsell?: string
}

export interface GenerationResult {
  success: boolean
  imageUrl?: string
  imageData?: string // base64
  error?: string
  metadata?: {
    provider: string
    model: string
    prompt: string
    processingTime?: number
  }
}

export interface AIProviderConfig {
  name: string
  displayName: string
  apiKey: string
  model: string
  enabled: boolean
}

export abstract class AIProvider {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract generateImage(params: GenerationParams): Promise<GenerationResult>
  abstract buildPrompt(params: GenerationParams): string
  abstract validateConfig(): boolean

  getName(): string {
    return this.config.name
  }

  getDisplayName(): string {
    return this.config.displayName
  }

  isEnabled(): boolean {
    return this.config.enabled && this.validateConfig()
  }
}