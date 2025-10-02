import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { fal } from '@fal-ai/client'

import { getProviderManager, type ProviderType } from '@/lib/ai-providers'
import { errorLogger, retryManager, withErrorHandling } from '@/lib/error-management'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Provider Integration] Starting POST /api/generate')

    // Initialize AI Provider Manager
    const providerManager = getProviderManager()
    console.log('✅ Provider manager initialized')

    // Configure Fal AI client at the beginning (backward compatibility)
    if (!process.env.FAL_KEY) {
      throw new Error('FAL_KEY environment variable is not configured')
    }

    fal.config({
      credentials: process.env.FAL_KEY
    })
    console.log('✅ Fal AI client configured successfully')

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
      const plans = subscription.plans as unknown as { generation_limit: number }
      const limit = plans.generation_limit
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
    
    // AIプロバイダー選択を追加（デフォルトはfal-ai）
    const selectedProvider = (formData.get('aiProvider') as ProviderType) || 'fal-ai'
    
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
      
      const { error: originalUploadError } = await supabase.storage
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

    console.log('🔍 Generation Parameters Debug:', {
      layoutSideBySide: layoutSideBySide,
      backgroundColor: backgroundColor,
      wallColor: wallColor,
      roofColor: roofColor,
      doorColor: doorColor,
      weather: weather,
      selectedProvider: selectedProvider
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
        prompt: `${selectedProvider} provider generation`, // Temporary placeholder
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
        prompt: `${selectedProvider} provider generation`,
        status: 'processing'
      })
      return NextResponse.json(
        { error: '履歴の作成に失敗しました', details: historyError?.message },
        { status: 500 }
      )
    }

    // Call AI Provider for image generation
    try {
      console.log(`🚀 [Provider Integration] Using ${selectedProvider} provider`)

      // Set the selected provider
      const providerSet = providerManager.setCurrentProvider(selectedProvider)
      if (!providerSet) {
        throw new Error(`Failed to set AI provider: ${selectedProvider}`)
      }
      console.log(`✅ Provider set to: ${selectedProvider}`)

      // Prepare generation parameters
      const generationParams = {
        mainImage: mainImageBase64,
        sideImage: sideImageBase64 || undefined,
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
      }

      console.log('📤 Calling AI provider for image generation...')
      console.log('🖼️ Input images:', sideImageBase64 ? 2 : 1)
      console.log('🎨 Colors:', { wallColor, roofColor, doorColor })

      // Record API call start
      console.log('📝 API call started for generation ID:', historyRecord.id)

      // Call provider manager for unified image generation with retry logic
      const result = await retryManager.executeWithRetry(
        () => providerManager.generateImage(generationParams),
        'api',
        { userId: user?.id }
      )

      console.log('✅ AI Provider API call completed')
      console.log('📊 Generation result:', {
        success: result.success,
        hasImageUrl: !!result.imageUrl,
        hasImageData: !!result.imageData,
        provider: result.metadata?.provider
      })

      // Handle imageData to imageUrl conversion for providers like Gemini
      let finalImageUrl = result.imageUrl
      if (result.success && !result.imageUrl && result.imageData) {
        console.log('🔄 Converting imageData to imageUrl for provider:', selectedProvider)
        try {
          // Convert base64 to buffer
          const imageBuffer = Buffer.from(result.imageData, 'base64')
          const fileName = `generated_${Date.now()}.png`
          
          // Upload to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(`${user.id}/${fileName}`, imageBuffer, {
              contentType: 'image/png',
              upsert: false
            })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('generated-images')
              .getPublicUrl(`${user.id}/${fileName}`)
            finalImageUrl = publicUrl
            console.log('✅ ImageData converted to imageUrl:', finalImageUrl)
          } else {
            console.error('❌ Failed to upload imageData:', uploadError.message)
          }
        } catch (conversionError) {
          console.error('❌ ImageData conversion error:', conversionError)
        }
      }

      // Update generation history with result
      console.log('💾 Updating database record for generation ID:', historyRecord.id)
      
      // Prepare update data based on provider
      const updateData: {
        status: string
        generated_image_url: string | null
        completed_at: string
        error_message: string | null
        prompt: string
      } = {
        status: result.success ? 'completed' : 'failed',
        generated_image_url: finalImageUrl ?? null,
        completed_at: new Date().toISOString(),
        error_message: result.success ? null : (result.error || `${selectedProvider} APIから画像データが返されませんでした`),
        prompt: result.metadata?.prompt || `${selectedProvider} provider generated prompt`
      }

      // Add provider-specific response data only for Fal AI
      // NOTE: fal_response column temporarily disabled due to schema constraints
      // if (selectedProvider === 'fal-ai' && result.metadata) {
      //   updateData.fal_response = JSON.stringify(result.metadata)
      // }

      // Enhanced database update with error handling
      try {
        await withErrorHandling(
          async () => {
            const { error: updateError } = await serviceSupabase
              .from('generations')
              .update(updateData)
              .eq('id', historyRecord.id)

            if (updateError) {
              throw new Error(`Database update failed: ${updateError.message}`)
            }
          },
          'api',
          { retry: true, userId: user?.id }
        )()
        console.log('✅ Database record updated successfully')
      } catch (updateError) {
        console.error('❌ Database update error:', updateError)
        // Log the error but don't fail the entire request
        errorLogger.log(
          updateError instanceof Error ? updateError : new Error(String(updateError)),
          'api',
          { userId: user?.id, url: request.url }
        )
      }

      // Increment usage count only if successful with error handling
      if (result.success && finalImageUrl) {
        try {
          await withErrorHandling(
            async () => {
              const { error: countError } = await serviceSupabase
                .from('subscriptions')
                .update({
                  generation_count: subscription ? subscription.generation_count + 1 : 1
                })
                .eq('user_id', user.id)
                .eq('status', 'active')

              if (countError) {
                throw new Error(`Usage count update failed: ${countError.message}`)
              }
            },
            'api',
            { retry: true, userId: user?.id }
          )()
          console.log('✅ Usage count incremented successfully')
        } catch (countError) {
          console.error('❌ Usage count increment error:', countError)
          // Log the error but don't fail the entire request
          errorLogger.log(
            countError instanceof Error ? countError : new Error(String(countError)),
            'api',
            { userId: user?.id, url: request.url }
          )
        }
      }

      return NextResponse.json({
        success: result.success,
        historyId: historyRecord.id,
        imageUrl: finalImageUrl,
        originalImageUrl: originalImageUrl,
        hasImage: !!finalImageUrl,
        prompt: result.metadata?.prompt, // Provider-generated prompt
        provider: result.metadata?.provider,
        generated_image_url: finalImageUrl, // For backward compatibility
        message: result.success ? '画像生成が完了しました' : (result.error || `${selectedProvider} APIから画像データが返されませんでした`)
      })

    } catch (providerError: unknown) {
      const errorMessage = providerError instanceof Error ? providerError.message : String(providerError)

      // Enhanced error logging with error management system
      errorLogger.log(
        providerError instanceof Error ? providerError : new Error(errorMessage),
        'api',
        {
          userId: user?.id,
          url: request.url,
          retryCount: 0
        }
      )

      console.error(`❌ ${selectedProvider} Provider Error:`, errorMessage)
      console.error('🔍 Error details:', {
        message: providerError instanceof Error ? providerError.message : String(providerError),
        provider: selectedProvider,
        stack: providerError instanceof Error ? providerError.stack?.split('\n')[0] : 'No stack trace'
      })

      const finalErrorMessage = errorMessage || `${selectedProvider} API呼び出しに失敗しました`

      // Update history record with error using error handling wrapper
      try {
        await withErrorHandling(
          async () => {
            await serviceSupabase
              .from('generations')
              .update({
                status: 'failed',
                error_message: finalErrorMessage,
                completed_at: new Date().toISOString()
              })
              .eq('id', historyRecord.id)
          },
          'api',
          { retry: true, userId: user?.id }
        )()
      } catch (updateError) {
        console.error('❌ Failed to update history record with error:', updateError)
      }

      return NextResponse.json(
        {
          success: false,
          error: `${selectedProvider} API呼び出しに失敗しました`,
          details: finalErrorMessage,
          historyId: historyRecord.id,
          provider: selectedProvider
        },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Enhanced error logging with error management system
    errorLogger.log(
      error instanceof Error ? error : new Error(errorMessage),
      'api',
      {
        userId: 'unknown', // User might not be available at this level
        url: request.url,
        retryCount: 0
      }
    )

    console.error('Generation Error:', error)
    console.error('🔍 Main error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace available',
      url: request.url
    })

    return NextResponse.json(
      {
        error: errorMessage || 'サーバーエラーが発生しました',
        timestamp: new Date().toISOString(),
        errorType: 'api'
      },
      { status: 500 }
    )
  }
}

