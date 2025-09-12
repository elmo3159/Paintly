/**
 * Gemini 2.5 Flash Image Preview - シンプルな画像生成テスト
 * このコードは基本的な動作確認用です
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w');

async function testImageGeneration() {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview'
    });

    // Simple prompt for testing
    const prompt = '美しい青い空と白い雲がある日本の住宅街の風景を生成してください。塗装業者の視点から見た、リフォーム前の一般的な住宅の外観。';

    console.log('🎨 Generating image with Gemini 2.5 Flash Image Preview...');
    console.log('📝 Prompt:', prompt);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          // Save image
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const filename = `test-image-${Date.now()}.png`;
          fs.writeFileSync(filename, imageBuffer);
          console.log(`✅ Image saved: ${filename} (${(imageBuffer.length/1024).toFixed(2)} KB)`);
          return true;
        }
      }
    }
    
    console.log('⚠️ No image generated');
    return false;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run test
testImageGeneration();