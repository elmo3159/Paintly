// Direct test of Fal AI Seedream 4.0 API with corrected parameters
import { fal } from '@fal-ai/client'
import fs from 'fs'

async function testFalAI() {
  try {
    console.log('🚀 Testing Fal AI Seedream 4.0 directly...')

    // Configure Fal AI with environment key
    const apiKey = 'b7dbaec1-ba92-4495-8d84-0f39ce6a0ff9:a9b764f4e5d1327ddad7882c48dd658c'

    // Configure fal client
    fal.config({
      credentials: apiKey
    })

    // Read the test image file
    const imagePath = './Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png'
    console.log('📁 Reading test image:', imagePath)

    const imageBuffer = fs.readFileSync(imagePath)
    console.log('📏 Image size:', (imageBuffer.length / 1024).toFixed(2), 'KB')

    // Create File object for Fal AI storage
    const imageFile = new File([imageBuffer], 'test-image.png', {
      type: 'image/png'
    })

    // Upload to Fal AI storage
    console.log('📤 Uploading to Fal AI storage...')
    const falImageUrl = await fal.storage.upload(imageFile)
    console.log('✅ Uploaded to:', falImageUrl)

    // Test API call with corrected parameters
    const falInput = {
      prompt: "この建物を指定色でプロフェッショナル塗装してください。外壁：「ライトブルー」（#D1E5E1、日塗工62-90A）",
      image_urls: [falImageUrl], // Correct: array format
      num_images: 1,
      image_size: "square_hd", // Correct: valid preset value
      seed: Math.floor(Math.random() * 1000000),
      enable_safety_checker: true
    }

    console.log('📤 Sending API request with parameters:', JSON.stringify(falInput, null, 2))

    const result = await fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
      input: falInput,
      logs: true,
      timeout: 60000,
      onQueueUpdate: (update) => {
        console.log('📊 Queue update:', update.status)
      }
    })

    console.log('✅ API call completed successfully!')
    console.log('📊 Response:', JSON.stringify(result, null, 2))

    if (result.data?.images && result.data.images.length > 0) {
      console.log('🎨 Generated image URL:', result.data.images[0].url)
      console.log('🎯 SUCCESS: Fal AI Seedream 4.0 is working with correct parameters!')
    } else {
      console.log('❌ No images returned in response')
    }

  } catch (error) {
    console.error('❌ Error testing Fal AI:', error.message)
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
  }
}

testFalAI()