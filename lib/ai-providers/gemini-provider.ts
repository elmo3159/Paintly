/**
 * Gemini AI プロバイダー実装
 * Google Gemini 2.5 Flash model for image generation
 */

import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai'
import { AIProvider, GenerationParams, GenerationResult } from './types'

export class GeminiProvider extends AIProvider {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor(apiKey: string) {
    super({
      name: 'gemini',
      displayName: 'Google Gemini 2.5 Flash Image',
      apiKey,
      model: 'gemini-2.5-flash-image',
      enabled: true
    })

    this.genAI = new GoogleGenerativeAI(this.config.apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: this.config.model
    })
  }

  validateConfig(): boolean {
    return !!this.config.apiKey
  }

  buildPrompt(params: GenerationParams): string {
    // Gemini 2.5 Flash Image用に最適化されたプロンプト
    let prompt = 'Edit this building image by applying professional paint according to the specifications below. '
    prompt += 'Maintain the exact structure, shape, and architectural details while changing only the specified colors.\n\n'

    // 汚れ除去と清掃の指示を追加
    prompt += '【汚れ・劣化除去指示】建物表面のあらゆる汚れ、シミ、カビ、コケ、経年劣化、変色、剥がれを完全に除去し、'
    prompt += '新築時のような清潔で美しい状態にしてから塗装を施してください。'
    prompt += '外壁、屋根、ドアの全ての面が清潔で均一な新品のような仕上がりになるよう注意深く処理してください。\n\n'

    // 色の指定（強化版 - 確実性を重視）
    if (params.wallColor !== '変更なし' && params.wallColorData) {
      // 新しいWebColorシステムか古いシステムかを判定
      const colorName = params.wallColorData.japaneseName || params.wallColorData.name
      const rgbValue = typeof params.wallColorData.rgb === 'string'
        ? params.wallColorData.rgb
        : `rgb(${params.wallColorData.rgb.r}, ${params.wallColorData.rgb.g}, ${params.wallColorData.rgb.b})`

      prompt += `【外壁色変更 - 必須実行】建物の外壁は必ず「${colorName}」色で完全に塗装してください。`
      prompt += `色の指定: 色名=${colorName}, RGB=${rgbValue}, カラーコード=${params.wallColorData.hex}。`
      prompt += `絶対に塗り残しがないよう、外壁の全ての面、角、継ぎ目、隅々まで確実に${params.wallColorData.hex}のカラーコードで塗装してください。`
      prompt += `影になる部分、奥まった部分、建物の裏側も含めて、見える全ての外壁面を漏れなく塗装してください。`
      prompt += `従来の壁色は完全に隠し、新しい色のみが見えるようにしてください。\n\n`
    }

    if (params.roofColor !== '変更なし' && params.roofColorData) {
      const colorName = params.roofColorData.japaneseName || params.roofColorData.name
      const rgbValue = typeof params.roofColorData.rgb === 'string'
        ? params.roofColorData.rgb
        : `rgb(${params.roofColorData.rgb.r}, ${params.roofColorData.rgb.g}, ${params.roofColorData.rgb.b})`

      prompt += `【屋根色変更 - 必須実行】屋根は必ず「${colorName}」色で完全に塗装してください。`
      prompt += `色の指定: 色名=${colorName}, RGB=${rgbValue}, カラーコード=${params.roofColorData.hex}。`
      prompt += `屋根の全ての面、瓦やスレートの一枚一枚、棟、軒先、谷部分まで確実に${params.roofColorData.hex}で塗装してください。`
      prompt += `屋根材の質感を活かしながら、影になる部分や複雑な形状の部分も含めて、見える全ての屋根面を漏れなく塗装してください。`
      prompt += `従来の屋根色は完全に隠し、新しい色のみが見えるようにしてください。\n\n`
    }

    if (params.doorColor !== '変更なし' && params.doorColorData) {
      const colorName = params.doorColorData.japaneseName || params.doorColorData.name
      const rgbValue = typeof params.doorColorData.rgb === 'string'
        ? params.doorColorData.rgb
        : `rgb(${params.doorColorData.rgb.r}, ${params.doorColorData.rgb.g}, ${params.doorColorData.rgb.b})`

      prompt += `【ドア色変更 - 必須実行】建物の玄関ドア（エントランスドアのみ）は必ず「${colorName}」色で完全に塗装してください。`
      prompt += `色の指定: 色名=${colorName}, RGB=${rgbValue}, カラーコード=${params.doorColorData.hex}。`
      prompt += `ドアの表面、枠、パネル、隅々まで確実に${params.doorColorData.hex}で塗装してください。`
      prompt += `ドア全体が均一で美しい仕上がりになるよう、従来のドア色は完全に隠してください。`
      prompt += `ドアハンドルやヒンジなどの金具は元の色を維持してください。`
      prompt += `【重要注意】窓、窓枠、雨樋、換気口、その他の建具には絶対に色を適用せず、元の色を完全に保持してください。`
      prompt += `窓とドアを絶対に間違えないよう注意し、ドアのみを塗装してください。\n\n`
    }

    // 品質確保の追加指示
    prompt += '【塗装品質確保】全ての指定色変更は必ず実行し、一切の塗り残しや不完全な部分がないことを確認してください。'
    prompt += '塗装面は完全に均一で、ムラ、筋、色の濃淡がない完璧な仕上がりにしてください。'
    prompt += '元の汚れや劣化の痕跡は一切残さず、新品同様の美しい状態を実現してください。\n\n'

    // 天候と照明（詩的な表現は維持）
    const weatherNarrative = {
      '変更なし': '元の画像と同じ照明条件と天候を維持し、塗装色の変更のみを行ってください。周辺環境、光の当たり方、陰影のパターンを元画像のまま保持してください。',
      '晴れ': '澄み渡る青空の下、燦々と降り注ぐ太陽の光が新しく塗装された建物を明るく照らしています。くっきりとした影が建物の立体感を強調し、清潔な塗装の鮮やかな色彩が輝いて見えるようにしてください。',
      '曇り': '穏やかな曇り空の下、柔らかで均一な光が新しく塗装された建物全体を包み込んでいます。影は控えめですが、清潔な塗装の質感と色合いが優しく表現される絶好の条件です。',
      '雨': '雨に濡れた建物の表面が、新しい塗装の美しさを際立たせています。清潔な塗装面に雨粒が流れ、濡れた質感が建物に深みと趣を与えています。雨の日特有の柔らかな光が、新しい塗装色を優しく引き立てます。',
      '雪': '雪化粧をした幻想的な風景の中で、新しく塗装された建物が美しく佇んでいます。屋根や周辺に積もった雪が、清潔で鮮やかな塗装色をより一層引き立て、冬の美しい情景を作り出しています。'
    }

    prompt += weatherNarrative[params.weather as keyof typeof weatherNarrative] || weatherNarrative['変更なし']
    prompt += '\n\n'

    // レイアウト指示（改善版）
    if (params.layoutSideBySide) {
      const backgroundNarrative = {
        '白': '純白',
        '黒': '深い黒',
        '薄ピンク': '優しい薄ピンク'
      }
      const bgDescription = backgroundNarrative[params.backgroundColor as keyof typeof backgroundNarrative] || '純白'

      prompt += `この新しく美しく塗装された建物を、${bgDescription}の背景に切り抜いて配置してください。`

      if (params.hasSideImage) {
        prompt += `正面からの視点と横からの視点を左右に並べ、一枚の画像として美しく構成してください。`
        prompt += `左側には正面から見た塗装後の建物、右側にはユーザーが提供した横からの視点を同じ塗装仕様で表現してください。`
        prompt += `両方の視点で指定された色変更が確実に適用され、清潔で統一感のある美しい仕上がりにしてください。`
      } else {
        prompt += `正面からの視点と、AIが生成した横からの視点を左右に並べて、一枚の画像として美しく構成してください。`
        prompt += `両方の視点で同じ塗装仕様が確実に適用され、清潔で統一感のある美しい仕上がりにしてください。`
      }
      prompt += '\n\n'
    } else {
      prompt += '元の構図と視点を完全に維持し、周辺の環境も含めて自然に表現してください。ただし、指定された色変更は確実に実行してください。\n\n'
    }

    // 追加指示
    if (params.otherInstructions && params.otherInstructions.trim()) {
      prompt += `【追加要求事項】以下の点にも配慮して確実に実行してください：${params.otherInstructions}\n\n`
    }

    // 品質に関する最終指示（強化版）
    prompt += '【最終品質確認】画像は高解像度で写実的に、実際の塗装工事を行った後の建物の外観を忠実に再現してください。'
    prompt += '色彩は指定されたカラーコードに正確に一致させ、塗装のムラや不自然な部分が一切ない、'
    prompt += 'プロフェッショナルな塗装職人による完璧な仕上がりを表現してください。'
    prompt += '汚れ、シミ、劣化は完全に除去され、新品同様の清潔で美しい状態を実現してください。'
    prompt += '指定された色変更は必ず全て実行し、一切の塗り残しがないことを確認してください。\n\n'

    // Gemini向けの強化指示
    prompt += '【生成指示】上記の全ての条件を満たし、指定された色に確実に塗装され、汚れが完全に除去された美しい建物の画像を生成してください。'
    prompt += '色変更が不完全だったり、汚れが残っていたりする場合は、必ず修正して完璧な状態にしてください。'

    return prompt
  }

  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 [Gemini] Starting image generation...')
      
      const prompt = this.buildPrompt(params)

      // Gemini用のコンテンツ配列を構築
      const contentParts: (string | Part)[] = [prompt]

      // メイン画像を追加
      contentParts.push({
        inlineData: {
          data: params.mainImage,
          mimeType: 'image/png'
        }
      })

      // サイド画像がある場合は追加
      if (params.sideImage) {
        contentParts.push({
          inlineData: {
            data: params.sideImage,
            mimeType: 'image/png'
          }
        })
      }

      console.log('📤 [Gemini] Sending request to Gemini 2.5 Flash...')

      const result = await this.model.generateContent(contentParts)
      const response = await result.response
      
      console.log('✅ [Gemini] API call completed')
      console.log('📊 [Gemini] Response candidates:', response.candidates?.length || 0)

      // 🔍 Enhanced debugging for Vercel deployment
      console.log('🔍 [Gemini Debug] Full response structure:', JSON.stringify({
        candidatesCount: response.candidates?.length,
        hasCandidates: !!response.candidates,
        firstCandidateExists: !!response.candidates?.[0],
        firstCandidateContent: !!response.candidates?.[0]?.content,
        firstCandidateParts: response.candidates?.[0]?.content?.parts?.length,
        promptFeedback: response.promptFeedback,
        usageMetadata: response.usageMetadata
      }, null, 2))

      // 生成された画像を抽出
      let generatedImageData: string | null = null

      if (response.candidates?.[0]?.content?.parts) {
        console.log('🔍 [Gemini Debug] Parts details:', response.candidates[0].content.parts.map((part, idx) => ({
          index: idx,
          hasText: !!part.text,
          textPreview: part.text?.substring(0, 100),
          hasInlineData: !!part.inlineData,
          mimeType: part.inlineData?.mimeType,
          dataLength: part.inlineData?.data?.length
        })))

        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            console.log('📄 [Gemini] Text response received')
          }

          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/')) {
            generatedImageData = part.inlineData.data
            console.log('🎨 [Gemini] Generated image found:', (generatedImageData?.length || 0 / 1024).toFixed(2), 'KB')
            break
          }
        }
      } else {
        console.warn('⚠️ [Gemini] No parts found in response!')
      }

      const processingTime = Date.now() - startTime

      return {
        success: !!generatedImageData,
        imageData: generatedImageData || undefined,
        error: !generatedImageData ? 'Gemini APIから画像データが返されませんでした' : undefined,
        metadata: {
          provider: this.config.name,
          model: this.config.model,
          prompt: prompt,
          processingTime
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('❌ [Gemini] Generation error:', errorMessage)

      return {
        success: false,
        error: errorMessage || 'Gemini API呼び出しに失敗しました',
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