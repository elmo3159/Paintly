import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { wallColors, roofColors, doorColors } from '@/lib/paint-colors'

// Initialize Gemini AI with API key for image generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Check usage limit
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select(`
        generation_count,
        plans (
          generation_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscription && subscription.plans) {
      const limit = (subscription.plans as any).generation_limit
      const used = subscription.generation_count
      if (used >= limit) {
        return NextResponse.json(
          { error: '生成回数の上限に達しました' },
          { status: 403 }
        )
      }
    }

    // Parse form data
    const formData = await request.formData()
    const mainImage = formData.get('mainImage') as File
    const sideImage = formData.get('sideImage') as File | null
    const customerId = formData.get('customerId') as string
    const wallColor = formData.get('wallColor') as string
    const roofColor = formData.get('roofColor') as string
    const doorColor = formData.get('doorColor') as string
    const weather = formData.get('weather') as string
    const layoutSideBySide = formData.get('layoutSideBySide') === 'true'
    const backgroundColor = formData.get('backgroundColor') as string
    const otherInstructions = formData.get('otherInstructions') as string

    if (!mainImage || !customerId) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      )
    }

    // Convert images to base64
    const mainImageBytes = await mainImage.arrayBuffer()
    const mainImageBase64 = Buffer.from(mainImageBytes).toString('base64')
    
    let sideImageBase64: string | null = null
    if (sideImage) {
      const sideImageBytes = await sideImage.arrayBuffer()
      sideImageBase64 = Buffer.from(sideImageBytes).toString('base64')
    }

    // Build prompt first
    const prompt = buildPrompt({
      wallColor,
      roofColor,
      doorColor,
      weather,
      layoutSideBySide,
      backgroundColor,
      otherInstructions,
      hasSideImage: !!sideImage
    })

    // Create generation history record
    const { data: historyRecord, error: historyError } = await supabase
      .from('generation_history')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        wall_color: wallColor,
        roof_color: roofColor,
        door_color: doorColor,
        weather: weather,
        layout_side_by_side: layoutSideBySide,
        background_color: backgroundColor,
        other_instructions: otherInstructions,
        prompt: prompt,
        status: 'processing'
      })
      .select()
      .single()

    if (historyError || !historyRecord) {
      return NextResponse.json(
        { error: '履歴の作成に失敗しました' },
        { status: 500 }
      )
    }

    // Call Gemini API
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-image-preview',
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        } as any
      })
      
      const imageParts = [
        {
          inlineData: {
            data: mainImageBase64,
            mimeType: mainImage.type
          }
        }
      ]

      if (sideImageBase64 && sideImage) {
        imageParts.push({
          inlineData: {
            data: sideImageBase64,
            mimeType: sideImage.type
          }
        })
      }

      const result = await model.generateContent([prompt, ...imageParts])
      const response = await result.response
      
      let generatedImageUrl: string | null = null
      let generatedImageData: string | null = null

      // Process response parts to find generated image
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            generatedImageData = part.inlineData.data
            break
          }
        }
        if (generatedImageData) break
      }

      if (generatedImageData) {
        // Convert base64 to buffer for upload
        const imageBuffer = Buffer.from(generatedImageData, 'base64')
        const fileName = `generated_${historyRecord.id}.png`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('generations')
          .upload(`${user.id}/${fileName}`, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('generations')
          .getPublicUrl(`${user.id}/${fileName}`)
        
        generatedImageUrl = publicUrl
      }

      await supabase
        .from('generation_history')
        .update({
          status: generatedImageUrl ? 'completed' : 'failed',
          gemini_response: { 
            hasImage: !!generatedImageData,
            imageUrl: generatedImageUrl 
          },
          completed_at: new Date().toISOString(),
          error_message: !generatedImageUrl ? '画像生成に失敗しました' : null
        })
        .eq('id', historyRecord.id)

      // Increment usage count
      await supabase
        .from('subscriptions')
        .update({
          generation_count: subscription ? subscription.generation_count + 1 : 1
        })
        .eq('user_id', user.id)
        .eq('status', 'active')

      return NextResponse.json({
        success: true,
        historyId: historyRecord.id,
        imageUrl: generatedImageUrl,
        hasImage: !!generatedImageData,
        message: generatedImageUrl ? '画像生成が完了しました' : '画像生成に失敗しました'
      })

    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError)
      
      // Update history record with error
      await supabase
        .from('generation_history')
        .update({
          status: 'failed',
          error_message: geminiError.message || '画像生成に失敗しました'
        })
        .eq('id', historyRecord.id)

      return NextResponse.json(
        { error: '画像生成に失敗しました' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

function buildPrompt({
  wallColor,
  roofColor,
  doorColor,
  weather,
  layoutSideBySide,
  backgroundColor,
  otherInstructions,
  hasSideImage
}: {
  wallColor: string
  roofColor: string
  doorColor: string
  weather: string
  layoutSideBySide: boolean
  backgroundColor: string
  otherInstructions: string
  hasSideImage: boolean
}): string {
  let prompt = 'この建物の塗装後のイメージを生成してください。\n\n'

  // Add color specifications
  if (wallColor !== '変更なし') {
    const color = wallColors.find(c => c.name === wallColor)
    if (color && color.code) {
      prompt += `壁の色は、R.G.B: ${color.rgb.r} ${color.rgb.g} ${color.rgb.b} ・16進数カラーコード: ${color.hex} `
      if (color.munsell) {
        prompt += `・マンセル値: ${color.munsell} `
      }
      prompt += `・日本塗料工業会色番号: ${color.code} の色に変更してください。\n`
    }
  }

  if (roofColor !== '変更なし') {
    const color = roofColors.find(c => c.name === roofColor)
    if (color && color.code) {
      prompt += `屋根の色は、R.G.B: ${color.rgb.r} ${color.rgb.g} ${color.rgb.b} ・16進数カラーコード: ${color.hex} `
      if (color.munsell) {
        prompt += `・マンセル値: ${color.munsell} `
      }
      prompt += `・日本塗料工業会色番号: ${color.code} の色に変更してください。\n`
    }
  }

  if (doorColor !== '変更なし') {
    const color = doorColors.find(c => c.name === doorColor)
    if (color && color.code) {
      prompt += `ドアの色は、R.G.B: ${color.rgb.r} ${color.rgb.g} ${color.rgb.b} ・16進数カラーコード: ${color.hex} `
      if (color.munsell) {
        prompt += `・マンセル値: ${color.munsell} `
      }
      prompt += `・日本塗料工業会色番号: ${color.code} の色に変更してください。\n`
    }
  }

  // Add weather condition
  prompt += `\n天候条件: ${weather}の状態で表現してください。\n`

  // Add layout instructions if side-by-side is selected
  if (layoutSideBySide && hasSideImage) {
    prompt += `\nこの建物だけを切り抜いて、背景を${backgroundColor}にして、建物を横から見た画像も１枚の画像に並べてください。\n`
  }

  // Add other instructions
  if (otherInstructions) {
    prompt += `\nその他の指定: ${otherInstructions}\n`
  }

  // Add quality instructions
  prompt += '\n高品質でリアルな仕上がりにしてください。建物の構造は変更せず、色のみを変更してください。'

  return prompt
}