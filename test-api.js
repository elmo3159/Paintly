const fs = require('fs');

// テスト用のAPIリクエスト
const testImageGeneration = async () => {
  try {
    // テスト画像をBase64に変換
    const imageBuffer = fs.readFileSync('.playwright-mcp/test-building.png');
    const imageBase64 = imageBuffer.toString('base64');
    
    console.log('Testing API with image generation...');
    console.log('Image size:', imageBuffer.length, 'bytes');
    
    // FormDataを作成
    const formData = new FormData();
    
    // テスト画像のBlobを作成
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('mainImage', blob, 'test-building.png');
    formData.append('customerId', 'test-customer-001');
    formData.append('wallColor', 'レッド');  // 日塗工番号: 07-40X
    formData.append('roofColor', '変更なし');
    formData.append('doorColor', '変更なし');
    formData.append('weather', '晴れ');
    formData.append('layoutSideBySide', 'false');
    formData.append('backgroundColor', 'white');
    formData.append('otherInstructions', '高品質で写実的に生成してください');

    console.log('Sending request to /api/generate...');
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response result:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('API failed:', result.error, result.details);
    } else {
      console.log('✅ Success! Image URL:', result.imageUrl);
      console.log('History ID:', result.historyId);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// サーバーが起動するまで待機
const waitForServer = async () => {
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch('http://localhost:3000/');
      if (response.ok) {
        console.log('Server is ready!');
        return true;
      }
    } catch (e) {
      // サーバーがまだ起動していない
    }
    console.log(`Waiting for server... (${i + 1}/30)`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  console.log('Server not ready after 60 seconds');
  return false;
};

// メイン実行
waitForServer().then(ready => {
  if (ready) {
    testImageGeneration();
  } else {
    console.log('Could not connect to server');
  }
});