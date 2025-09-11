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
      console.log('Starting Gemini API call with model: gemini-2.5-flash-image-preview')
      console.log('Prompt length:', prompt.length)
      console.log('Number of image parts:', sideImageBase64 ? 2 : 1)
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-image-preview'
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
  // Start with a detailed, narrative description as recommended by Gemini best practices
  let prompt = 'Create a detailed, photorealistic image showing this building after it has been professionally painted with the specified colors. The building should maintain its original architectural structure, windows, doors, and all existing features, with only the paint colors changed according to the specifications below.\n\n'

  // Add detailed color specifications with narrative descriptions
  if (wallColor !== '変更なし') {
    const color = wallColors.find(c => c.name === wallColor)
    if (color && color.code) {
      prompt += `The exterior walls of the building should be painted in a beautiful ${wallColor} color with the following exact specifications: RGB values ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b} (hex code ${color.hex})`
      if (color.munsell) {
        prompt += `, Munsell value ${color.munsell}`
      }
      prompt += `, corresponding to Japan Paint Industry color code ${color.code}. This color should be applied evenly across all wall surfaces with a smooth, professional finish.\n\n`
    }
  }

  if (roofColor !== '変更なし') {
    const color = roofColors.find(c => c.name === roofColor)
    if (color && color.code) {
      prompt += `The roof should be painted in an attractive ${roofColor} color with precise specifications: RGB ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b} (hex ${color.hex})`
      if (color.munsell) {
        prompt += `, Munsell ${color.munsell}`
      }
      prompt += `, Japan Paint Industry code ${color.code}. The roof color should complement the wall color beautifully while maintaining the roof's original texture and material appearance.\n\n`
    }
  }

  if (doorColor !== '変更なし') {
    const color = doorColors.find(c => c.name === doorColor)
    if (color && color.code) {
      prompt += `The entrance door and any other doors should be painted in an elegant ${doorColor} color: RGB ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b} (hex ${color.hex})`
      if (color.munsell) {
        prompt += `, Munsell ${color.munsell}`
      }
      prompt += `, Japan Paint Industry code ${color.code}. The door should have a crisp, clean finish that enhances the building's overall appearance.\n\n`
    }
  }

  // Add detailed weather and environmental conditions
  const weatherDescriptions = {
    '晴れ': 'bright sunny day with clear blue skies, natural sunlight casting realistic shadows on the building, creating a warm and inviting atmosphere',
    '曇り': 'overcast day with soft, diffused lighting from cloudy skies, creating even illumination across the building surfaces',
    '雨': 'light rain with wet surfaces reflecting light, puddles on the ground, and a fresh, clean atmosphere',
    '雪': 'gentle snowfall with snow accumulating on surfaces, creating a peaceful winter scene'
  }
  
  prompt += `The scene should be set during a ${weatherDescriptions[weather] || 'pleasant day with natural lighting'}. `

  // Add layout instructions if side-by-side is selected
  if (layoutSideBySide && hasSideImage) {
    prompt += `Please create a side-by-side comparison layout with a clean ${backgroundColor} background, showing both the front view and side view of the painted building in a single professional presentation image.\n\n`
  }

  // Add other custom instructions
  if (otherInstructions) {
    prompt += `Additional specific requirements: ${otherInstructions}\n\n`
  }

  // Add comprehensive quality and technical specifications
  prompt += 'The final image should be a high-quality, photorealistic architectural visualization that accurately represents how the building would look after professional painting. Maintain all original architectural details, textures, landscaping, and surrounding environment. The paint should look fresh and professionally applied with appropriate sheen and finish for each surface type. The lighting should be natural and realistic, and the overall composition should be suitable for presentation to clients.'

  return prompt
}