/**
 * テスト用画像生成API - 認証不要
 * 開発・デバッグ用のシンプルなGemini API呼び出し
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with API key for image generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const { prompt, testImage } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      )
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY環境変数が設定されていません' },
        { status: 500 }
      )
    }

    console.log('🧪 Test API - Starting Gemini API call')
    console.log('📝 Prompt:', prompt)

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image'
    })

    // Simple content array
    const contentParts = [prompt]

    // Add test image if provided
    if (testImage) {
      contentParts.push({
        inlineData: {
          data: testImage.data,
          mimeType: testImage.mimeType || 'image/png'
        }
      })
    }

    console.log('🚀 Sending request to Gemini...')

    const result = await model.generateContent(contentParts)
    const response = await result.response
    
    console.log('✅ API call completed')
    console.log('📊 Response candidates:', response.candidates?.length || 0)

    // Extract generated image
    let generatedImageData: string | null = null
    let textResponse: string = ''

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse = part.text
          console.log('📄 Text response received')
        }
        
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/')) {
          generatedImageData = part.inlineData.data
          console.log('🎨 Generated image found:', (generatedImageData.length / 1024).toFixed(2), 'KB')
          break
        }
      }
    }

    return NextResponse.json({
      success: !!generatedImageData,
      hasImage: !!generatedImageData,
      hasText: !!textResponse,
      textResponse: textResponse || null,
      imageData: generatedImageData || null,
      imageSize: generatedImageData ? `${(generatedImageData.length / 1024).toFixed(2)} KB` : null,
      candidatesCount: response.candidates?.length || 0,
      message: generatedImageData ? 'テスト画像生成成功！' : 'テキスト応答のみ（画像なし）'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('❌ Test API Error:', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: 'Gemini API呼び出しに失敗しました',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}