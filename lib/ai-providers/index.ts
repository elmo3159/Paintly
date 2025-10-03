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

// 具体的なプロバイダー実装（Geminiのみ）
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
  gemini: boolean
  count: number
} {
  const gemini = !!process.env.GEMINI_API_KEY
  
  return {
    gemini,
    count: gemini ? 1 : 0
  }
}