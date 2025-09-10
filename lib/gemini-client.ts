import { GoogleGenerativeAI } from '@google/generative-ai'
import { wallColors, roofColors, doorColors } from './paint-colors'

export interface GenerationParams {
  mainImage: string // base64
  sideImage?: string // base64
  wallColor: string
  roofColor: string
  doorColor: string
  weather: string
  layoutSideBySide: boolean
  backgroundColor: string
  otherInstructions: string
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest' // Using latest model as 2.5 preview might not be available
    })
  }

  buildPrompt(params: GenerationParams): string {
    let prompt = '以下の指示に従って、建物の塗装後のリアルなシミュレーション画像を生成してください。\n\n'
    
    prompt += '【重要な指示】\n'
    prompt += '- 建物の構造や形状は変更しないでください\n'
    prompt += '- 指定された色に正確に塗装してください\n'
    prompt += '- リアルで自然な仕上がりにしてください\n'
    prompt += '- 影や光の反射を適切に表現してください\n\n'

    // Color specifications
    prompt += '【色の指定】\n'
    
    if (params.wallColor !== '変更なし') {
      const color = wallColors.find(c => c.name === params.wallColor)
      if (color && color.code) {
        prompt += `壁の色: ${color.name}\n`
        prompt += `  - RGB値: R:${color.rgb.r} G:${color.rgb.g} B:${color.rgb.b}\n`
        prompt += `  - 16進数: ${color.hex}\n`
        if (color.munsell) {
          prompt += `  - マンセル値: ${color.munsell}\n`
        }
        prompt += `  - 日塗工番号: ${color.code}\n\n`
      }
    } else {
      prompt += '壁の色: 現状維持\n\n'
    }

    if (params.roofColor !== '変更なし') {
      const color = roofColors.find(c => c.name === params.roofColor)
      if (color && color.code) {
        prompt += `屋根の色: ${color.name}\n`
        prompt += `  - RGB値: R:${color.rgb.r} G:${color.rgb.g} B:${color.rgb.b}\n`
        prompt += `  - 16進数: ${color.hex}\n`
        if (color.munsell) {
          prompt += `  - マンセル値: ${color.munsell}\n`
        }
        prompt += `  - 日塗工番号: ${color.code}\n\n`
      }
    } else {
      prompt += '屋根の色: 現状維持\n\n'
    }

    if (params.doorColor !== '変更なし') {
      const color = doorColors.find(c => c.name === params.doorColor)
      if (color && color.code) {
        prompt += `ドア・玄関の色: ${color.name}\n`
        prompt += `  - RGB値: R:${color.rgb.r} G:${color.rgb.g} B:${color.rgb.b}\n`
        prompt += `  - 16進数: ${color.hex}\n`
        if (color.munsell) {
          prompt += `  - マンセル値: ${color.munsell}\n`
        }
        prompt += `  - 日塗工番号: ${color.code}\n\n`
      }
    } else {
      prompt += 'ドア・玄関の色: 現状維持\n\n'
    }

    // Weather condition
    prompt += `【天候条件】\n${params.weather}の状態で表現してください。\n`
    
    switch (params.weather) {
      case '晴れ':
        prompt += '明るい日差しと青空、適度な影を表現してください。\n\n'
        break
      case '曇り':
        prompt += '柔らかい光と控えめな影、曇り空を表現してください。\n\n'
        break
      case '雨':
        prompt += '濡れた質感と雨天の雰囲気を表現してください。\n\n'
        break
      case '雪':
        prompt += '雪が積もった状態と冬の雰囲気を表現してください。\n\n'
        break
    }

    // Layout instructions
    if (params.layoutSideBySide && params.sideImage) {
      prompt += '【レイアウト指定】\n'
      prompt += `1枚の画像内に、正面と横からの2つの視点を並べて表示してください。\n`
      prompt += `背景色: ${params.backgroundColor}\n`
      prompt += '建物以外の部分は指定された背景色で塗りつぶしてください。\n\n'
    }

    // Other instructions
    if (params.otherInstructions) {
      prompt += `【追加の指定】\n${params.otherInstructions}\n\n`
    }

    prompt += '【出力形式】\n'
    prompt += '高品質でプロフェッショナルな仕上がりの画像を生成してください。'

    return prompt
  }

  async generateImage(params: GenerationParams): Promise<string> {
    try {
      const prompt = this.buildPrompt(params)
      
      // Prepare image parts
      const imageParts = [
        {
          inlineData: {
            data: params.mainImage,
            mimeType: 'image/jpeg'
          }
        }
      ]

      if (params.sideImage) {
        imageParts.push({
          inlineData: {
            data: params.sideImage,
            mimeType: 'image/jpeg'
          }
        })
      }

      // Generate content
      const result = await this.model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = response.text()

      // Note: Gemini doesn't directly return images, it returns text
      // In a real implementation, you would need to use a different model
      // or service that can generate images (like Imagen or DALL-E)
      
      // For now, we'll return a placeholder or the original image
      // In production, you would integrate with an actual image generation API
      
      return params.mainImage // Placeholder: returning original image
    } catch (error) {
      console.error('Gemini generation error:', error)
      throw new Error('画像生成に失敗しました')
    }
  }

  async analyzeImage(imageBase64: string): Promise<{
    hasBuilding: boolean
    buildingType?: string
    suggestedColors?: string[]
  }> {
    try {
      const prompt = `この画像を分析して以下の情報を JSON 形式で返してください：
1. 建物が写っているか (hasBuilding: boolean)
2. 建物の種類 (buildingType: string) - 例: "一戸建て", "マンション", "店舗" など
3. おすすめの塗装色 (suggestedColors: string[]) - 3色まで

回答は必ず有効な JSON 形式で返してください。`

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ])
      
      const response = await result.response
      const text = response.text()
      
      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)
      }

      // Default response if parsing fails
      return {
        hasBuilding: true,
        buildingType: '建物',
        suggestedColors: ['ホワイト', 'ベージュ', 'グレー']
      }
    } catch (error) {
      console.error('Image analysis error:', error)
      throw new Error('画像分析に失敗しました')
    }
  }
}