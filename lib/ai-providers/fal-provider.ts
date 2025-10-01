/**
 * Fal AI プロバイダー実装
 * Seedream 4.0 model for image-to-image generation
 */

import { fal } from '@fal-ai/client'
import { AIProvider, GenerationParams, GenerationResult } from './types'

interface FalInput {
  prompt: string
  image_urls: string[]
  num_images: number
  image_size: string
  enable_safety_checker: boolean
}

export class FalAIProvider extends AIProvider {
  constructor(apiKey: string) {
    super({
      name: 'fal-ai',
      displayName: 'Fal AI (Seedream 4.0)',
      apiKey,
      model: 'fal-ai/bytedance/seedream/v4/edit',
      enabled: true
    })

    // Configure Fal AI client
    fal.config({
      credentials: this.config.apiKey
    })
  }

  validateConfig(): boolean {
    return !!this.config.apiKey
  }

  buildPrompt(params: GenerationParams): string {
    // ナラティブスタイルの感情豊かなプロンプト（現在の実装と同じ）
    let prompt = '【重要】この建物の塗装色を指定通りに確実に変更した写真を生成してください。\n\n'
    // 汚れ・劣化除去指示
    prompt += '【汚れ・劣化除去指示】\n'
    prompt += '建物表面のあらゆる汚れ、シミ、カビ、コケ、経年劣化、変色、剥がれを完全に除去し、'
    prompt += '新築時のような美しく清潔な状態にしてください。\n\n'

    // 色の指定（ナラティブスタイル）
    if (params.wallColor !== '変更なし' && params.wallColorData) {
      prompt += `【外壁色変更 - 必須実行】\n`
      prompt += `- 建物の外壁の色を「${params.wallColorData.name}」（${params.wallColorData.hex}、日塗工${params.wallColorData.code}）に確実に変更してください\n`
      prompt += `- RGB値: ${params.wallColorData.rgb}\n`
      prompt += `- 外壁全体を指定された色で均一に塗装し、元の色を完全に置き換えてください\n`
      prompt += `- 壁の質感は維持しつつ、色だけを確実に変更してください\n\n`
    }

    if (params.roofColor !== '変更なし' && params.roofColorData) {
      prompt += `【屋根色変更 - 必須実行】\n`
      prompt += `- 屋根の色を「${params.roofColorData.name}」（${params.roofColorData.hex}、日塗工${params.roofColorData.code}）に確実に変更してください\n`
      prompt += `- RGB値: ${params.roofColorData.rgb}\n`
      prompt += `- 屋根材の質感を保ちながら、指定された色に確実に塗装してください\n\n`
    }

    if (params.doorColor !== '変更なし' && params.doorColorData) {
      prompt += `【ドア色変更 - 必須実行】\n`
      prompt += `- 玄関ドアの色を「${params.doorColorData.name}」（${params.doorColorData.hex}、日塗工${params.doorColorData.code}）に確実に変更してください\n`
      prompt += `- RGB値: ${params.doorColorData.rgb}\n`
      prompt += `- ドアハンドルや金具は元の色を維持してください\n`
      prompt += `- 窓や他の建具は変更せず、ドアのみ色を変更してください\n\n`
    }

    // 天候と照明（詩的な表現）
    const weatherNarrative = {
      '変更なし': '元の画像と同じ照明条件と天候を維持し、塗装色の変更のみを行ってください。周辺環境、光の当たり方、陰影のパターンを元画像のまま保持してください。',
      '晴れ': '澄み渡る青空の下、燦々と降り注ぐ太陽の光が建物を明るく照らしています。くっきりとした影が建物の立体感を強調し、塗装の鮮やかな色彩が輝いて見えるようにしてください。',
      '曇り': '穏やかな曇り空の下、柔らかで均一な光が建物全体を包み込んでいます。影は控えめですが、塗装の質感と色合いが優しく表現される絶好の条件です。',
      '雨': '雨に濡れた建物の表面が、しっとりとした美しさを醸し出しています。塗装面に雨粒が流れ、濡れた質感が建物に深みと趣を与えています。雨の日特有の柔らかな光が、塗装の色を優しく引き立てます。',
      '雪': '雪化粧をした幻想的な風景の中で、建物が静かに佇んでいます。屋根や周辺に積もった雪が、塗装された建物の色彩をより一層引き立て、冬の美しい情景を作り出しています。'
    }

    prompt += weatherNarrative[params.weather as keyof typeof weatherNarrative] || weatherNarrative['変更なし']
    prompt += '\n\n'

    // レイアウト指示（ナラティブスタイル）
    if (params.layoutSideBySide) {
      const backgroundNarrative = {
        '白': '純白',
        '黒': '深い黒',
        '薄ピンク': '優しい薄ピンク'
      }
      const bgDescription = backgroundNarrative[params.backgroundColor as keyof typeof backgroundNarrative] || '純白'

      prompt += `この美しく塗装された建物を、${bgDescription}の背景に切り抜いて配置してください。`

      if (params.hasSideImage) {
        prompt += `正面からの視点と横からの視点を左右に並べ、一枚の画像として美しく構成してください。`
        prompt += `左側には正面から見た塗装後の建物、右側にはユーザーが提供した横からの視点を同じ塗装仕様で表現してください。`
      } else {
        prompt += `正面からの視点と、AIが生成した横からの視点を左右に並べて、一枚の画像として美しく構成してください。`
        prompt += `両方の視点で同じ塗装仕様が適用され、統一感のある美しい仕上がりにしてください。`
      }
      prompt += '\n\n'
    } else {
      prompt += '元の構図と視点を完全に維持し、周辺の環境も含めて自然に表現してください。\n\n'
    }

    // 追加指示
    if (params.otherInstructions && params.otherInstructions.trim()) {
      prompt += `さらに、以下の点にも配慮してください：${params.otherInstructions}\n\n`
    }

    // 品質に関する最終指示（ナラティブ）
    prompt += '画像は高解像度で写実的に、実際の塗装工事を行った後の建物の外観を忠実に再現してください。'
    prompt += '色彩は指定されたカラーコードに正確に一致させ、塗装のムラや不自然な部分が一切ない、'
    prompt += 'プロフェッショナルな塗装職人による完璧な仕上がりを表現してください。'
    prompt += '建物の細部まで丁寧に塗装され、窓枠、雨樋、換気口などの要素も適切に処理されている状態を表現してください。\n\n'

    // Fal AI向けの直接指示
    prompt += 'このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。'

    return prompt
  }

  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 [Fal AI] Starting image generation...')
      console.log('🚨🚨🚨 [FORCE RECOMPILE] Timestamp:', new Date().toISOString())
      
      const prompt = this.buildPrompt(params)
      
      // Convert base64 to File for Fal AI storage
      const mainImageBytes = Buffer.from(params.mainImage, 'base64')
      const imageFile = new File([mainImageBytes], 'image.png', {
        type: 'image/png'
      })

      // Upload to Fal AI storage
      const falImageUrl = await fal.storage.upload(imageFile)
      console.log('✅ [Fal AI] Image uploaded to storage:', falImageUrl)

      // 📊 Corrected input parameters based on official Fal AI documentation
      const falInput: FalInput = {
        prompt: prompt,
        image_urls: [falImageUrl],
        num_images: 1,
        // 🔧 Fix: Use correct image_size format according to official documentation
        image_size: "auto_2K",
        enable_safety_checker: true
      }

      console.log('📤 [Fal AI] Sending request to Seedream 4.0...')
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Request input:', JSON.stringify(falInput, null, 2))
      console.log('🚨🚨🚨 [CRITICAL DEBUG] image_size value:', falInput.image_size)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] image_size type:', typeof falInput.image_size)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Prompt content (first 500 chars):', prompt.substring(0, 500))
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Prompt length:', prompt.length)

      let result
      try {
        result = await fal.subscribe(this.config.model, {
          input: falInput,
          logs: true,
          timeout: 60000,
          onQueueUpdate: (update) => {
            console.log('📊 [Fal AI] Queue update:', update.status)
            // 📊 詳細なキュー情報をログ出力
            console.log('🔍 [Fal AI Debug] Queue update details:', JSON.stringify(update, null, 2))
          }
        })
      } catch (subscribeError: unknown) {
        // 📊 強化されたsubscribeエラーの詳細情報を出力
        const errorMessage = subscribeError instanceof Error ? subscribeError.message : 'Unknown error'
        const errorDetails = subscribeError instanceof Error ? {
          message: subscribeError.message,
          stack: subscribeError.stack,
          fullError: JSON.stringify(subscribeError, null, 2)
        } : {
          message: String(subscribeError),
          fullError: JSON.stringify(subscribeError, null, 2)
        }
        console.error('🚨🚨🚨 [CRITICAL ERROR] Subscribe error details:', errorDetails)
        console.error('🚨🚨🚨 [CRITICAL ERROR] Raw error object:', subscribeError)
        throw subscribeError
      }

      console.log('✅ [Fal AI] API call completed')

      // 📊 強化されたデバッグ: APIレスポンス全体を詳細分析
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Full API response:', JSON.stringify(result, null, 2))
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Response data type:', typeof result.data)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Response data:', result.data)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Result keys:', Object.keys(result))
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Images array:', result.data?.images)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Images length:', result.data?.images?.length)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Error field:', (result as Record<string, unknown>).error)
      console.log('🚨🚨🚨 [CRITICAL DEBUG] Status:', (result as Record<string, unknown>).status)

      let generatedImageUrl: string | null = null

      if (result.data?.images && result.data.images.length > 0) {
        generatedImageUrl = result.data.images[0].url
        console.log('✅ [Fal AI] Generated image URL:', generatedImageUrl)
      } else {
        console.log('❌ [Fal AI] No images found in response')
        console.log('🔍 [Fal AI Debug] Raw result structure:', Object.keys(result))
        if (result.data) {
          console.log('🔍 [Fal AI Debug] Data structure:', Object.keys(result.data))
        }
      }

      const processingTime = Date.now() - startTime

      return {
        success: !!generatedImageUrl,
        imageUrl: generatedImageUrl || undefined,
        error: !generatedImageUrl ? 'Fal AI APIから画像データが返されませんでした' : undefined,
        metadata: {
          provider: this.config.name,
          model: this.config.model,
          prompt: prompt,
          processingTime
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('❌ [Fal AI] Generation error:', errorMessage)
      console.error('🔍 [Fal AI Debug] Full error object:', error)

      return {
        success: false,
        error: errorMessage || 'Fal AI API呼び出しに失敗しました',
        metadata: {
          provider: this.config.name,
          model: this.config.model,
          prompt: this.buildPrompt(params),
          processingTime: Date.now() - startTime
        }
      }
    }
  }
}