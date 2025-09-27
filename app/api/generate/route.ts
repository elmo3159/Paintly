import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { colorPromptArray } from '@/lib/hierarchical-paint-colors'

// Initialize Gemini AI with API key for image generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [UPDATED] Starting POST /api/generate - Cache Refresh Test')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Create service role client for database operations that need to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('👤 User check:', user ? `Found user: ${user.id}` : 'No user found')
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
    
    // Parse detailed color data
    const wallColorData = formData.get('wallColorData') ? JSON.parse(formData.get('wallColorData') as string) : null
    const roofColorData = formData.get('roofColorData') ? JSON.parse(formData.get('roofColorData') as string) : null
    const doorColorData = formData.get('doorColorData') ? JSON.parse(formData.get('doorColorData') as string) : null
    
    // 🚨 Critical Debug: Check if color data is being received
    console.log('🚨 Color Data Reception Debug:', {
      wallColorDataRaw: formData.get('wallColorData'),
      roofColorDataRaw: formData.get('roofColorData'), 
      doorColorDataRaw: formData.get('doorColorData'),
      wallColorDataParsed: wallColorData,
      roofColorDataParsed: roofColorData,
      doorColorDataParsed: doorColorData,
      wallColorDataExists: !!wallColorData
    })
    
    // デバッグ: フォームデータの確認
    console.log('🔍 Form Data Debug:', {
      layoutSideBySide: formData.get('layoutSideBySide'),
      layoutSideBySideBoolean: layoutSideBySide,
      backgroundColor: backgroundColor,
      wallColor: wallColor,
      roofColor: roofColor,
      doorColor: doorColor,
      weather: weather,
      hasSideImage: !!sideImage
    })
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

    // Save original image to storage for comparison feature
    let originalImageUrl: string | null = null
    try {
      const originalImageBuffer = Buffer.from(mainImageBytes)
      const originalFileName = `original_${Date.now()}.${mainImage.type.split('/')[1]}`
      
      const { data: originalUploadData, error: originalUploadError } = await supabase.storage
        .from('generated-images')
        .upload(`${user.id}/${originalFileName}`, originalImageBuffer, {
          contentType: mainImage.type,
          upsert: false
        })

      if (!originalUploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('generated-images')
          .getPublicUrl(`${user.id}/${originalFileName}`)
        originalImageUrl = publicUrl
        console.log('✅ Original image uploaded successfully:', originalImageUrl)
      } else {
        console.warn('⚠️ Original image upload failed:', originalUploadError.message)
      }
    } catch (error) {
      console.warn('⚠️ Original image upload error:', error)
    }

    // Build prompt first
    const prompt = buildPrompt({
      wallColor,
      roofColor,
      doorColor,
      wallColorData,
      roofColorData,
      doorColorData,
      weather,
      layoutSideBySide,
      backgroundColor,
      otherInstructions,
      hasSideImage: !!sideImage
    })
    
    console.log('🔍 Generated Prompt Debug:', {
      promptLength: prompt.length,
      includesLayoutInstruction: prompt.includes('切り抜いて'),
      includesSideBySide: prompt.includes('並べ'),
      layoutSideBySide: layoutSideBySide,
      backgroundColor: backgroundColor,
      prompt: prompt
    })

    // Create generation history record using service role to bypass RLS constraints
    const { data: historyRecord, error: historyError } = await serviceSupabase
      .from('generations')
      .insert({
        user_id: user.id,
        customer_page_id: customerId,
        original_image_url: originalImageUrl,
        wall_color: wallColor,
        roof_color: roofColor,
        door_color: doorColor,
        weather: weather,
        other_instructions: otherInstructions,
        prompt: prompt,
        status: 'processing'
      })
      .select()
      .single()

    if (historyError || !historyRecord) {
      console.error('❌ Database insert error:', historyError)
      console.error('Insert data was:', {
        user_id: user.id,
        customer_page_id: customerId,
        original_image_url: originalImageUrl || 'placeholder',
        wall_color: wallColor,
        roof_color: roofColor,
        door_color: doorColor,
        weather: weather,
        other_instructions: otherInstructions,
        prompt: prompt,
        status: 'processing'
      })
      return NextResponse.json(
        { error: '履歴の作成に失敗しました', details: historyError?.message },
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
      const contentParts = [
        prompt,
        {
          inlineData: {
            data: mainImageBase64,
            mimeType: mainImage.type
          }
        }
      ]

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
      await serviceSupabase
        .from('generations')
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
          await serviceSupabase
            .from('generations')
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
        
        await serviceSupabase
          .from('generations')
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
          .from('generated-images')
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
          .from('generated-images')
          .getPublicUrl(`${user.id}/${fileName}`)
        
        generatedImageUrl = publicUrl
        console.log('✅ Image uploaded successfully:', generatedImageUrl)
      } else {
        console.log('⚠️ No image data found in Gemini response')
      }

      // Update generation history
      console.log('💾 Updating database record for generation ID:', historyRecord.id)
      const { error: updateError } = await serviceSupabase
        .from('generations')
        .update({
          status: generatedImageUrl ? 'completed' : 'failed',
          generated_image_url: generatedImageUrl,
          gemini_response: {
            status: 'completed',
            hasImage: !!generatedImageData,
            imageUrl: generatedImageUrl,
            originalImageUrl: originalImageUrl,
            timestamp: new Date().toISOString()
          },
          completed_at: new Date().toISOString(),
          error_message: !generatedImageUrl ? 'Gemini APIから画像データが返されませんでした' : null
        })
        .eq('id', historyRecord.id)

      if (updateError) {
        console.error('❌ Database update error:', updateError)
      } else {
        console.log('✅ Database record updated successfully')
      }

      // Increment usage count only if successful
      if (generatedImageUrl) {
        await serviceSupabase
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
        originalImageUrl: originalImageUrl,
        hasImage: !!generatedImageData,
        prompt: prompt,
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
      await serviceSupabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: errorMessage,
          gemini_response: {
            status: 'error',
            error: errorMessage,
            hasImage: false,
            imageUrl: null,
            originalImageUrl: originalImageUrl,
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
  wallColorData,
  roofColorData,
  doorColorData,
  weather,
  layoutSideBySide,
  backgroundColor,
  otherInstructions,
  hasSideImage
}: {
  wallColor: string
  roofColor: string
  doorColor: string
  wallColorData: any
  roofColorData: any
  doorColorData: any
  weather: string
  layoutSideBySide: boolean
  backgroundColor: string
  otherInstructions: string
  hasSideImage: boolean
}): string {
  // 🔍 Critical Debug: Check color data before building prompt
  console.log('🎨 BuildPrompt Color Debug:', {
    wallColor,
    wallColorData,
    roofColor,
    roofColorData,
    doorColor,
    doorColorData,
    wallColorDataExists: !!wallColorData,
    wallColorDataKeys: wallColorData ? Object.keys(wallColorData) : null
  })

  // 日本語ナラティブプロンプトによる詳細で写実的な指示
  let prompt = 'この建物を指定された色でプロフェッショナルに塗装した後の詳細で写実的な画像を生成してください。建物の元の建築構造、窓、ドア、その他すべての特徴を維持し、塗料の色のみを以下の仕様に従って変更してください。\n\n'

  // 壁色の詳細仕様
  if (wallColor !== '変更なし' && wallColorData) {
    prompt += `建物の外壁は美しい「${wallColorData.name}」色で塗装してください。正確な仕様：RGB値 ${wallColorData.rgb.r}, ${wallColorData.rgb.g}, ${wallColorData.rgb.b}（16進コード ${wallColorData.hex}）`
    if (wallColorData.munsell) {
      prompt += `、マンセル値 ${wallColorData.munsell}`
    }
    prompt += `、日本塗料工業会色番号 ${wallColorData.code}。この色をすべての壁面に均一に、滑らかでプロフェッショナルな仕上がりで塗布してください。

`
  }

  if (roofColor !== '変更なし' && roofColorData) {
    prompt += `屋根は魅力的な「${roofColorData.name}」色で塗装してください。正確な仕様：RGB値 ${roofColorData.rgb.r}, ${roofColorData.rgb.g}, ${roofColorData.rgb.b}（16進コード ${roofColorData.hex}）`
    if (roofColorData.munsell) {
      prompt += `、マンセル値 ${roofColorData.munsell}`
    }
    prompt += `、日本塗料工業会色番号 ${roofColorData.code}。屋根の色は壁の色と美しく調和し、屋根の元のテクスチャと素材感を維持してください。

`
  }

  if (doorColor !== '変更なし' && doorColorData) {
    prompt += `玄関ドアおよびその他のドアはエレガントな「${doorColorData.name}」色で塗装してください。正確な仕様：RGB値 ${doorColorData.rgb.r}, ${doorColorData.rgb.g}, ${doorColorData.rgb.b}（16進コード ${doorColorData.hex}）`
    if (doorColorData.munsell) {
      prompt += `、マンセル値 ${doorColorData.munsell}`
    }
    prompt += `、日本塗料工業会色番号 ${doorColorData.code}。ドアは鮮明で清潔な仕上がりにし、建物全体の外観を向上させてください。

`
  }

  // 詳細な天候・環境条件の日本語説明
  const weatherDescriptions = {
    '変更なし': '自然で心地よい日中の照明環境で、建物の色彩と質感が美しく映える理想的な撮影条件',
    '晴れ': '快晴の青空が広がる明るい晴天で、自然な太陽光が建物にリアルな影を作り出し、暖かく親しみやすい雰囲気を演出する',
    '曇り': '雲に覆われた穏やかな曇り空で、柔らかく拡散した光が建物表面を均等に照らす',
    '雨': '軽やかな雨が降り、濡れた表面が光を反射し、地面に水たまりができ、新鮮で清潔な雰囲気を作り出す',
    '雪': '穏やかな雪が降り積もり、表面に雪が積もって平和な冬の情景を作り出す'
  }

  prompt += `シーンは${weatherDescriptions[weather as keyof typeof weatherDescriptions] || weatherDescriptions['変更なし']}に設定してください。`

  // サイドバイサイドレイアウトの指示
  if (layoutSideBySide) {
    const backgroundColorMap = {
      '白': '真っ白',
      '黒': '真っ黒',
      '薄ピンク': '薄ピンク色'
    }
    const backgroundDescription = backgroundColorMap[backgroundColor as keyof typeof backgroundColorMap] || '真っ白'

    // 並べて表示の場合は、切り抜きと並べて表示を最優先の指示として上書き
    prompt = prompt.replace(
      '最終画像は、プロの塗装後の建物の外観を正確に表現する高品質で写実的な建築ビジュアライゼーションにしてください。すべての元の建築詳細、テクスチャ、造園、周辺環境を維持してください。',
      ''
    )

    if (hasSideImage) {
      prompt += `

【重要な指示】この建物だけを切り抜いて、背景を${backgroundDescription}にしてください。正面の建物の画像と、提供された横から見た建物の画像を1枚の画像に並べて表示してください。周辺環境は削除し、建物のみを表示してください。

`
    } else {
      prompt += `

【最重要指示】この建物だけを切り抜いて、背景を${backgroundDescription}にしてください。正面から見た建物の画像と、AIで生成した横から見た建物の画像を1枚の画像に並べて表示してください。周辺環境は削除し、建物のみを表示してください。2つの視点の建物を必ず並べて表示してください。

`
    }
    
    // 並べて表示の場合は天候設定を簡略化
    prompt = prompt.replace(/シーンは.*?に設定してください。/, '')
  } else {
    // 通常の場合は元の指示を維持
    prompt += '最終画像は、プロの塗装後の建物の外観を正確に表現する高品質で写実的な建築ビジュアライゼーションにしてください。すべての元の建築詳細、テクスチャ、造園、周辺環境を維持してください。'
  }

  // 顧客からの追加指示
  if (otherInstructions) {
    prompt += `追加の具体的要件：${otherInstructions}

`
  }

  // 総合的な品質と技術仕様（並べて表示の場合は追加しない）
  if (!layoutSideBySide) {
    prompt += `最終画像は、プロの塗装後の建物の外観を正確に表現する高品質で写実的な建築ビジュアライゼーションにしてください。すべての元の建築詳細、テクスチャ、造園、周辺環境を維持してください。塗料は新鮮でプロフェッショナルに塗布され、各表面タイプに適した光沢と仕上がりを持つように表現してください。照明は自然でリアルに、全体の構成は顧客への提案に適したものにしてください。

`
  } else {
    prompt += `塗料は新鮮でプロフェッショナルに塗布され、各表面タイプに適した光沢と仕上がりを持つように表現してください。

`
  }

  // 明示的な画像生成指示
  prompt += 'このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。'

  return prompt
}