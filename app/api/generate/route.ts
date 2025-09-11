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
      console.log('GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY)
      console.log('Starting Gemini API call with model: gemini-2.5-flash-image')
      console.log('Prompt length:', prompt.length)
      console.log('Number of image parts:', sideImageBase64 ? 2 : 1)
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-image'
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

      console.log('Calling generateContent...')
      console.log('Input prompt:', prompt)
      console.log('Number of image parts:', imageParts.length)
      
      // Record debug info in database
      await supabase
        .from('generation_history')
        .update({
          gemini_response: { 
            debug: 'Starting Gemini API call',
            prompt_length: prompt.length,
            image_count: imageParts.length,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', historyRecord.id)
      
      const result = await model.generateContent([prompt, ...imageParts])
      console.log('Gemini API call completed, getting response...')
      const response = await result.response
      console.log('Response object keys:', Object.keys(response))
      console.log('Full response:', JSON.stringify(response, null, 2))
      
      // Record response info in database
      await supabase
        .from('generation_history')
        .update({
          gemini_response: { 
            debug: 'Gemini API call completed',
            response_keys: Object.keys(response),
            candidates_count: response.candidates?.length || 0,
            full_response: JSON.stringify(response),
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', historyRecord.id)
      
      let generatedImageUrl: string | null = null
      let generatedImageData: string | null = null

      // Process response parts to find generated image
      console.log('Number of candidates:', response.candidates?.length || 0)
      const debugInfo = {
        candidates_count: response.candidates?.length || 0,
        candidates_details: [] as any[],
        image_found: false,
        search_process: [] as string[]
      }
      
      for (let i = 0; i < (response.candidates || []).length; i++) {
        const candidate = response.candidates![i]
        console.log(`Candidate ${i}:`, JSON.stringify(candidate, null, 2))
        console.log(`Candidate ${i} parts count:`, candidate.content?.parts?.length || 0)
        
        const candidateInfo = {
          index: i,
          parts_count: candidate.content?.parts?.length || 0,
          parts_details: [] as any[]
        }
        debugInfo.candidates_details.push(candidateInfo)
        
        for (let j = 0; j < (candidate.content?.parts || []).length; j++) {
          const part = candidate.content!.parts![j]
          console.log(`Part ${j}:`, JSON.stringify(part, null, 2))
          
          const partInfo = {
            index: j,
            has_inlineData: !!part.inlineData,
            mimeType: part.inlineData?.mimeType || 'none',
            has_text: !!part.text,
            text_preview: part.text ? part.text.substring(0, 100) : null
          }
          candidateInfo.parts_details.push(partInfo)
          debugInfo.search_process.push(`Candidate ${i}, Part ${j}: ${partInfo.mimeType}`)
          
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            console.log('Found image data in part:', j)
            debugInfo.image_found = true
            debugInfo.search_process.push(`IMAGE FOUND in Candidate ${i}, Part ${j}`)
            generatedImageData = part.inlineData.data
            break
          }
        }
        if (generatedImageData) break
      }
      
      // Record detailed search results in database
      await supabase
        .from('generation_history')
        .update({
          gemini_response: { 
            debug: 'Image search completed',
            search_results: debugInfo,
            image_found: !!generatedImageData,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', historyRecord.id)

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
      console.error('Error details:', {
        message: geminiError.message,
        code: geminiError.code,
        status: geminiError.status,
        statusText: geminiError.statusText,
        stack: geminiError.stack
      })
      
      // Create detailed error message
      const errorDetails = {
        type: 'gemini_api_error',
        message: geminiError.message,
        code: geminiError.code,
        status: geminiError.status,
        statusText: geminiError.statusText,
        timestamp: new Date().toISOString()
      }
      
      // Update history record with detailed error
      await supabase
        .from('generation_history')
        .update({
          status: 'failed',
          error_message: geminiError.message || 'Gemini API呼び出しに失敗しました',
          gemini_response: { 
            error: errorDetails,
            hasImage: false,
            imageUrl: null 
          }
        })
        .eq('id', historyRecord.id)

      return NextResponse.json(
        { 
          error: 'Gemini API呼び出しに失敗しました',
          details: geminiError.message 
        },
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
  // 日本語ナラティブプロンプトによる詳細で写実的な指示
  let prompt = 'この建物を指定された色でプロフェッショナルに塗装した後の詳細で写実的な画像を生成してください。建物の元の建築構造、窓、ドア、その他すべての特徴を維持し、塗料の色のみを以下の仕様に従って変更してください。\n\n'

  // 壁色の詳細仕様
  if (wallColor !== '変更なし') {
    const color = wallColors.find(c => c.name === wallColor)
    if (color && color.code) {
      prompt += `建物の外壁は美しい「${wallColor}」色で塗装してください。正確な仕様：RGB値 ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}（16進コード ${color.hex}）`
      if (color.munsell) {
        prompt += `、マンセル値 ${color.munsell}`
      }
      prompt += `、日本塗料工業会色番号 ${color.code}。この色をすべての壁面に均一に、滑らかでプロフェッショナルな仕上がりで塗布してください。\n\n`
    }
  }

  if (roofColor !== '変更なし') {
    const color = roofColors.find(c => c.name === roofColor)
    if (color && color.code) {
      prompt += `屋根は魅力的な「${roofColor}」色で塗装してください。正確な仕様：RGB値 ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}（16進コード ${color.hex}）`
      if (color.munsell) {
        prompt += `、マンセル値 ${color.munsell}`
      }
      prompt += `、日本塗料工業会色番号 ${color.code}。屋根の色は壁の色と美しく調和し、屋根の元のテクスチャと素材感を維持してください。\n\n`
    }
  }

  if (doorColor !== '変更なし') {
    const color = doorColors.find(c => c.name === doorColor)
    if (color && color.code) {
      prompt += `玄関ドアおよびその他のドアはエレガントな「${doorColor}」色で塗装してください。正確な仕様：RGB値 ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}（16進コード ${color.hex}）`
      if (color.munsell) {
        prompt += `、マンセル値 ${color.munsell}`
      }
      prompt += `、日本塗料工業会色番号 ${color.code}。ドアは鮮明で清潔な仕上がりにし、建物全体の外観を向上させてください。\n\n`
    }
  }

  // 詳細な天候・環境条件の日本語説明
  const weatherDescriptions = {
    '晴れ': '快晴の青空が広がる明るい晴天で、自然な太陽光が建物にリアルな影を作り出し、暖かく親しみやすい雰囲気を演出する',
    '曇り': '雲に覆われた穏やかな曇り空で、柔らかく拡散した光が建物表面を均等に照らす',
    '雨': '軽やかな雨が降り、濡れた表面が光を反射し、地面に水たまりができ、新鮮で清潔な雰囲気を作り出す',
    '雪': '穏やかな雪が降り積もり、表面に雪が積もって平和な冬の情景を作り出す'
  }
  
  prompt += `シーンは${weatherDescriptions[weather as keyof typeof weatherDescriptions] || '自然な照明の心地よい日中'}に設定してください。`

  // サイドバイサイドレイアウトの指示
  if (layoutSideBySide && hasSideImage) {
    prompt += `清潔な${backgroundColor}色の背景で、塗装後の建物の正面図と側面図を並べて表示する、単一のプロフェッショナルなプレゼンテーション画像を作成してください。\n\n`
  }

  // 顧客からの追加指示
  if (otherInstructions) {
    prompt += `追加の具体的要件：${otherInstructions}\n\n`
  }

  // 総合的な品質と技術仕様
  prompt += '最終画像は、プロの塗装後の建物の外観を正確に表現する高品質で写実的な建築ビジュアライゼーションにしてください。すべての元の建築詳細、テクスチャ、造園、周辺環境を維持してください。塗料は新鮮でプロフェッショナルに塗布され、各表面タイプに適した光沢と仕上がりを持つように表現してください。照明は自然でリアルに、全体の構成は顧客への提案に適したものにしてください。\n\n'

  // 明示的な画像生成指示
  prompt += 'このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。'

  return prompt
}