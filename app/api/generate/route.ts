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

    // Call Gemini API for image generation
    try {
      // Validate API key
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not configured')
      }
      
      console.log('🚀 Starting Gemini API call with model: gemini-2.5-flash-image-preview')
      console.log('📝 Prompt length:', prompt.length)
      console.log('🖼️ Input images:', sideImageBase64 ? 2 : 1)
      console.log('🔑 API Key configured:', process.env.GEMINI_API_KEY ? 'Yes' : 'No')
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-image-preview'
      })
      
      // Prepare content array for Gemini API
      const contentParts = [prompt]
      
      // Add main image
      contentParts.push({
        inlineData: {
          data: mainImageBase64,
          mimeType: mainImage.type
        }
      })

      // Add side image if provided
      if (sideImageBase64 && sideImage) {
        contentParts.push({
          inlineData: {
            data: sideImageBase64,
            mimeType: sideImage.type
          }
        })
      }

      console.log('📤 Sending request to Gemini API...')
      
      // Record API call start
      await supabase
        .from('generation_history')
        .update({
          gemini_response: { 
            status: 'api_call_started',
            prompt_length: prompt.length,
            image_count: contentParts.length - 1,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', historyRecord.id)
      
      const result = await model.generateContent(contentParts)
      const response = await result.response
      
      console.log('✅ Gemini API call completed')
      console.log('📊 Response candidates:', response.candidates?.length || 0)
      
      let generatedImageUrl: string | null = null
      let generatedImageData: string | null = null

      // Extract generated image from response - Enhanced error handling
      if (response.candidates && response.candidates.length > 0) {
        console.log(`🔍 Processing ${response.candidates.length} candidate(s)`)
        
        for (let i = 0; i < response.candidates.length; i++) {
          const candidate = response.candidates[i]
          
          if (!candidate.content?.parts) {
            console.log(`⚠️ Candidate ${i}: No content parts found`)
            continue
          }
          
          console.log(`📝 Candidate ${i}: Found ${candidate.content.parts.length} parts`)
          
          for (let j = 0; j < candidate.content.parts.length; j++) {
            const part = candidate.content.parts[j]
            
            if (part.text) {
              console.log(`📄 Part ${j}: Text response - ${part.text.substring(0, 100)}...`)
            }
            
            if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/')) {
              console.log(`🎨 Part ${j}: Found generated image data (${part.inlineData.mimeType})`)
              console.log(`📏 Image data size: ${(part.inlineData.data.length / 1024).toFixed(2)} KB`)
              generatedImageData = part.inlineData.data
              break
            }
          }
          
          if (generatedImageData) break
        }
        
        if (!generatedImageData) {
          console.log('⚠️ No image data found in any candidate')
          
          // Record the full response for debugging
          await supabase
            .from('generation_history')
            .update({
              gemini_response: { 
                status: 'no_image_in_response',
                candidates_count: response.candidates.length,
                debug_response: JSON.stringify(response, null, 2),
                timestamp: new Date().toISOString()
              }
            })
            .eq('id', historyRecord.id)
        }
      } else {
        console.log('❌ No candidates found in Gemini response')
        
        await supabase
          .from('generation_history')
          .update({
            gemini_response: { 
              status: 'no_candidates',
              full_response: JSON.stringify(response, null, 2),
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', historyRecord.id)
      }
      
      console.log('🔍 Final image extraction result:', !!generatedImageData)

      if (generatedImageData) {
        console.log('💾 Uploading generated image to storage...')
        
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
          console.error('❌ Upload error:', uploadError)
          throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('generations')
          .getPublicUrl(`${user.id}/${fileName}`)
        
        generatedImageUrl = publicUrl
        console.log('✅ Image uploaded successfully:', generatedImageUrl)
      } else {
        console.log('⚠️ No image data found in Gemini response')
      }

      // Update generation history
      await supabase
        .from('generation_history')
        .update({
          status: generatedImageUrl ? 'completed' : 'failed',
          gemini_response: { 
            status: 'completed',
            hasImage: !!generatedImageData,
            imageUrl: generatedImageUrl,
            timestamp: new Date().toISOString()
          },
          completed_at: new Date().toISOString(),
          error_message: !generatedImageUrl ? 'Gemini APIから画像データが返されませんでした' : null
        })
        .eq('id', historyRecord.id)

      // Increment usage count only if successful
      if (generatedImageUrl) {
        await supabase
          .from('subscriptions')
          .update({
            generation_count: subscription ? subscription.generation_count + 1 : 1
          })
          .eq('user_id', user.id)
          .eq('status', 'active')
      }

      return NextResponse.json({
        success: !!generatedImageUrl,
        historyId: historyRecord.id,
        imageUrl: generatedImageUrl,
        hasImage: !!generatedImageData,
        message: generatedImageUrl ? '画像生成が完了しました' : 'Gemini APIから画像データが返されませんでした'
      })

    } catch (geminiError: any) {
      console.error('❌ Gemini API Error:', geminiError.message)
      console.error('🔍 Error details:', {
        message: geminiError.message,
        code: geminiError.code,
        status: geminiError.status
      })
      
      const errorMessage = geminiError.message || 'Gemini API呼び出しに失敗しました'
      
      // Update history record with error
      await supabase
        .from('generation_history')
        .update({
          status: 'failed',
          error_message: errorMessage,
          gemini_response: { 
            status: 'error',
            error: errorMessage,
            hasImage: false,
            imageUrl: null,
            timestamp: new Date().toISOString()
          },
          completed_at: new Date().toISOString()
        })
        .eq('id', historyRecord.id)

      return NextResponse.json(
        { 
          success: false,
          error: 'Gemini API呼び出しに失敗しました',
          details: errorMessage,
          historyId: historyRecord.id
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