/**
 * Gemini 2.5 Flash Image Preview - Base64形式での画像生成テスト
 * Paintlyアプリケーションに統合するための形式
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w');

/**
 * Gemini APIを使用して画像を生成し、Base64形式で返す
 * @param {string} prompt - 画像生成用のプロンプト
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
async function generateImageBase64(prompt) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview'
    });

    console.log('🚀 Requesting image generation...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          console.log('✅ Image generated successfully');
          return {
            success: true,
            data: part.inlineData.data, // Base64 encoded image
            mimeType: part.inlineData.mimeType || 'image/png'
          };
        }
      }
    }
    
    return {
      success: false,
      error: 'No image data in response'
    };
    
  } catch (error) {
    console.error('❌ Generation error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test function
async function runTest() {
  console.log('='.repeat(60));
  console.log('🎨 Paintly - Base64 Image Generation Test');
  console.log('='.repeat(60));
  
  // Paintly用のテストプロンプト
  const testPrompts = [
    {
      name: 'House with blue walls',
      prompt: '日本の住宅の外観。壁は美しい青色（日塗工番号N-75相当）に塗装されている。屋根は黒、ドアは白。晴れた日の写真。プロフェッショナルな建築写真のスタイル。'
    },
    {
      name: 'House with red roof',
      prompt: '日本の一般的な住宅。白い壁、赤い瓦屋根（日塗工番号07-40X相当の赤）、茶色のドア。曇りの日。リアルな写真スタイル。'
    }
  ];
  
  for (const test of testPrompts) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`Prompt: ${test.prompt.substring(0, 100)}...`);
    
    const result = await generateImageBase64(test.prompt);
    
    if (result.success) {
      // Save as file for verification
      const filename = `test-base64-${test.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      const imageBuffer = Buffer.from(result.data, 'base64');
      fs.writeFileSync(filename, imageBuffer);
      
      console.log(`✅ Success!`);
      console.log(`📏 Base64 length: ${result.data.length} characters`);
      console.log(`📁 Saved as: ${filename} (${(imageBuffer.length/1024).toFixed(2)} KB)`);
      console.log(`🖼️ MIME type: ${result.mimeType}`);
      
      // Show sample of Base64 data (first 100 chars)
      console.log(`📄 Base64 sample: ${result.data.substring(0, 100)}...`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed');
  console.log('='.repeat(60));
}

// Run the test
runTest();