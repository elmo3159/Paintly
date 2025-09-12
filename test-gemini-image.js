/**
 * Gemini 2.5 Flash Image Preview API テストコード
 * Paintlyログイン画面背景用の画像生成テスト
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// API Key from environment variable
const GEMINI_API_KEY = 'AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generatePaintlyLoginBackground() {
  try {
    console.log('🎨 Paintly Background Image Generation Test Starting...');
    console.log('Using model: gemini-2.5-flash-image-preview');
    
    // Get the model - trying the exact model name from the API
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview'
    });

    // Paintly用のプロンプト（塗装会社向けのプロフェッショナルな背景画像）
    const prompt = `Generate a professional, modern background image for a painting company's web application login screen called "Paintly".

    Requirements:
    - Clean, modern, and professional aesthetic
    - Subtle paint-related elements (abstract paint strokes, color gradients)
    - Use a calming color palette with blues, whites, and soft grays
    - The image should work well as a background with login forms overlaid
    - Soft, blurred elements to not distract from foreground content
    - Professional business feeling suitable for B2B painting contractors
    - Include subtle geometric patterns or shapes suggesting architectural elements
    - Resolution: 1920x1080 pixels
    - Style: Minimalist, contemporary, business-friendly
    
    The overall feeling should be: professional, trustworthy, modern, and related to the painting/construction industry without being too literal.`;

    console.log('\n📝 Prompt:');
    console.log(prompt.substring(0, 200) + '...');

    // Generate content
    console.log('\n🚀 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    
    // Get the response
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Response received from API');
    console.log('Response text:', text ? text.substring(0, 200) + '...' : 'No text response');

    // Check if there's image data in the response
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      console.log('\n📊 Candidate data:', JSON.stringify(candidate, null, 2).substring(0, 500));
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Save the image
            const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            const outputPath = path.join(__dirname, 'paintly-login-background.png');
            fs.writeFileSync(outputPath, imageBuffer);
            console.log(`\n✅ Image saved to: ${outputPath}`);
            console.log(`📏 Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
            return outputPath;
          } else if (part.text) {
            console.log('\n📝 Text part:', part.text);
          }
        }
      }
    }

    console.log('\n⚠️ No image data found in response');
    console.log('Full response structure:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error generating image:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Note: The model name might need adjustment. Trying alternative approaches...');
      
      // Try with alternative model names
      const alternativeModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash-preview-image-generation',
        'gemini-pro-vision'
      ];
      
      console.log('Available alternative models to try:', alternativeModels);
    }
  }
}

// Run the test
console.log('='.repeat(60));
console.log('🎨 Paintly - Gemini Image Generation Test');
console.log('='.repeat(60));

generatePaintlyLoginBackground()
  .then((result) => {
    if (result) {
      console.log('\n✅ Test completed successfully!');
      console.log(`🖼️ Image saved at: ${result}`);
    } else {
      console.log('\n⚠️ Test completed but no image was generated');
    }
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
  })
  .finally(() => {
    console.log('\n' + '='.repeat(60));
    console.log('Test finished at:', new Date().toISOString());
    console.log('='.repeat(60));
  });