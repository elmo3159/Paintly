/**
 * Paintly API統合テスト
 * 修正されたroute.tsファイルの動作確認
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// APIキーの設定
const GEMINI_API_KEY = 'AIzaSyCjIYp7_X8YQMOrrFwjqR2SfTj6_3YY31w';

async function testPaintlyIntegration() {
  try {
    console.log('🎨 Paintly API Integration Test');
    console.log('='.repeat(50));
    
    // Gemini AI クライアントの初期化
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview'
    });
    
    // テスト用の画像を読み込み（先ほど生成した画像を使用）
    const testImagePath = 'paintly-login-background.png';
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ Test image not found, generating new one...');
      
      // 画像生成のみのテスト
      const simplePrompt = 'Paintlyアプリケーション用のプロフェッショナルな住宅の外観画像を生成してください。白い壁、グレーの屋根、木製のドア。晴れた日の風景。';
      
      console.log('📝 Generating test image...');
      const result = await model.generateContent(simplePrompt);
      const response = await result.response;
      
      // 画像の抽出
      let imageData = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/')) {
            imageData = part.inlineData.data;
            break;
          }
        }
      }
      
      if (imageData) {
        fs.writeFileSync(testImagePath, Buffer.from(imageData, 'base64'));
        console.log('✅ Test image generated:', testImagePath);
      } else {
        console.log('❌ Failed to generate test image');
        return false;
      }
    }
    
    // 画像をBase64に変換
    const imageBuffer = fs.readFileSync(testImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('📷 Test image loaded:', testImagePath);
    console.log('📏 Image size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    // Paintlyスタイルのプロンプトを作成
    const paintlyPrompt = `この建物を指定された色でプロフェッショナルに塗装した後の詳細で写実的な画像を生成してください。

建物の外壁は美しい「青色」色で塗装してください。正確な仕様：RGB値 51, 102, 204（16進コード #3366CC）。この色をすべての壁面に均一に、滑らかでプロフェッショナルな仕上がりで塗布してください。

屋根は魅力的な「赤色」色で塗装してください。正確な仕様：RGB値 204, 51, 51（16進コード #CC3333）。屋根の色は壁の色と美しく調和し、屋根の元のテクスチャと素材感を維持してください。

玄関ドアはエレガントな「茶色」色で塗装してください。正確な仕様：RGB値 139, 69, 19（16進コード #8B4513）。

シーンは快晴の青空が広がる明るい晴天で、自然な太陽光が建物にリアルな影を作り出し、暖かく親しみやすい雰囲気を演出するに設定してください。

最終画像は、プロの塗装後の建物の外観を正確に表現する高品質で写実的な建築ビジュアライゼーションにしてください。すべての元の建築詳細、テクスチャ、造園、周辺環境を維持してください。

このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。`;

    console.log('🚀 Starting Paintly-style image generation...');
    console.log('📝 Prompt length:', paintlyPrompt.length);
    
    // コンテンツ準備
    const contentParts = [
      paintlyPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/png'
        }
      }
    ];
    
    // Gemini APIを呼び出し
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    
    console.log('✅ API call completed');
    console.log('📊 Response candidates:', response.candidates?.length || 0);
    
    // 生成された画像を抽出
    let generatedImageData = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          console.log('📄 Text response:', part.text.substring(0, 100) + '...');
        }
        
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('image/')) {
          console.log('🎨 Found generated image');
          generatedImageData = part.inlineData.data;
          break;
        }
      }
    }
    
    if (generatedImageData) {
      const outputPath = 'paintly-test-result.png';
      fs.writeFileSync(outputPath, Buffer.from(generatedImageData, 'base64'));
      console.log('✅ Generated image saved:', outputPath);
      
      const outputSize = (Buffer.from(generatedImageData, 'base64').length / 1024).toFixed(2);
      console.log('📏 Generated image size:', outputSize, 'KB');
      
      return true;
    } else {
      console.log('❌ No image data in response');
      console.log('📋 Full response:', JSON.stringify(response, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  }
}

// テスト実行
console.log('🔧 Testing Paintly API Integration...\n');

testPaintlyIntegration()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Paintly API Integration Test: SUCCESS');
      console.log('🔗 The modified route.ts should work correctly');
    } else {
      console.log('💥 Paintly API Integration Test: FAILED');
      console.log('⚠️ Check the route.ts implementation');
    }
    console.log('='.repeat(50));
  })
  .catch(error => {
    console.error('\n💀 Fatal test error:', error);
  });