/**
 * AIプロバイダー抽象化レイヤー - エクスポートindex
 * Fal AIとGeminiの統一インターフェース
 */

// 型定義
export type {
  GenerationParams,
  ColorData,
  GenerationResult,
  AIProviderConfig
} from './types'

// 抽象基底クラス
export { AIProvider } from './types'

// 具体的なプロバイダー実装
export { FalAIProvider } from './fal-provider'
export { GeminiProvider } from './gemini-provider'

// プロバイダーマネージャー
export {
  type AIProviderManager,
  getProviderManager,
  initializeProviderManager,
  type ProviderType,
  type ProviderConfig
} from './provider-manager'

// 便利なヘルパー関数を削除し、直接 getProviderManager を使用することを推奨

/**
 * 環境変数をチェックして利用可能なプロバイダーを判定
 */
export function checkAvailableProviders(): {
  falAI: boolean
  gemini: boolean
  count: number
} {
  const falAI = !!process.env.FAL_KEY
  const gemini = !!process.env.GEMINI_API_KEY
  
  return {
    falAI,
    gemini,
    count: (falAI ? 1 : 0) + (gemini ? 1 : 0)
  }
}