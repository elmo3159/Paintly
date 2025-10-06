/**
 * Fal AI直接テストスクリプト
 * Paintlyで実際に使用されているFal AIによる画像生成テスト
 */

const fs = require('fs');
const path = require('path');

async function testFalAI() {
  console.log('🎨 Fal AI直接テスト開始...');

  // 環境変数の確認
  const falKey = process.env.FAL_KEY || 'b7dbaec1-ba92-4495-8d84-0f39ce6a0ff9:a9b764f4e5d1327ddad7882c48dd658c';
  console.log('✅ FAL_KEY確認完了');

  // テスト画像の確認
  const testImagePath = '/mnt/c/Users/elmod/Desktop/CursorApp/Paintly/Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png';

  try {
    const imageStats = fs.statSync(testImagePath);
    console.log('✅ テスト画像確認完了:', {
      size: `${(imageStats.size / 1024).toFixed(2)}KB`,
      path: testImagePath
    });
  } catch (error) {
    console.log('❌ テスト画像が見つかりません:', testImagePath);
    return;
  }

  // 画像をBase64エンコード
  const imageBuffer = fs.readFileSync(testImagePath);
  const base64Image = imageBuffer.toString('base64');
  console.log('✅ 画像Base64エンコード完了');

  // Fal AI APIリクエストペイロード（建物の色変更用）
  const payload = {
    "image_url": `data:image/png;base64,${base64Image}`,
    "prompt": `この建物の壁の色を変更してください。新しい壁の色は以下の通りです：
    - RGB: 185, 0, 25
    - 16進数カラーコード: #B90019
    - マンセル値: 7.5R4/14
    - 日本塗料工業会色番号: 07-40X

    壁の色のみを上記の色に変更し、屋根、ドア、その他の部分は元のまま保持してください。
    自然で現実的な塗装仕上がりにしてください。建物の構造や窓、周囲の環境は変更しないでください。`,
    "strength": 0.85,
    "guidance_scale": 7.5,
    "num_inference_steps": 50,
    "seed": 42
  };

  console.log('🚀 Fal AI API呼び出し開始...');

  try {
    // Fal AI のイメージ・トゥ・イメージモデルを使用
    const response = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 API応答ステータス:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API応答エラー:', errorText);

      // 利用可能なモデルの確認
      console.log('🔍 利用可能なモデルを確認中...');
      try {
        const modelsResponse = await fetch('https://fal.run/fal-ai/stable-diffusion-v3-medium/image-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "image_url": `data:image/png;base64,${base64Image}`,
            "prompt": "建物の壁を赤色に変更してください",
            "strength": 0.7
          })
        });

        console.log('📡 代替モデル応答ステータス:', modelsResponse.status);

        if (modelsResponse.ok) {
          const altResult = await modelsResponse.json();
          console.log('✅ 代替モデル（Stable Diffusion V3）での生成成功');
          console.log('🖼️ 生成画像URL:', altResult.images?.[0]?.url || '画像URLなし');

          if (altResult.images?.[0]?.url) {
            // 生成画像をダウンロード
            const imageResponse = await fetch(altResult.images[0].url);
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer();
              const outputPath = `./fal-ai-test-output-${Date.now()}.png`;
              fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
              console.log(`💾 生成画像保存完了: ${outputPath}`);
            }
          }

          return;
        }

      } catch (altError) {
        console.log('⚠️ 代替モデルテストも失敗:', altError.message);
      }

      return;
    }

    const result = await response.json();
    console.log('✅ Fal AI API応答受信成功');

    // レスポンスの構造を確認
    console.log('📊 API応答構造:', {
      hasImages: !!result.images,
      imageCount: result.images?.length || 0,
      hasUrl: !!result.images?.[0]?.url,
      seed: result.seed,
      hasTimings: !!result.timings
    });

    if (result.images && result.images.length > 0) {
      console.log('🖼️ 生成画像情報:');

      result.images.forEach((image, index) => {
        console.log(`画像${index + 1}:`, {
          url: image.url ? image.url.substring(0, 100) + '...' : 'URLなし',
          width: image.width,
          height: image.height
        });

        // 画像をダウンロードして保存
        if (image.url) {
          fetch(image.url)
            .then(res => res.arrayBuffer())
            .then(buffer => {
              const outputPath = `./fal-ai-test-output-${Date.now()}-${index}.png`;
              fs.writeFileSync(outputPath, Buffer.from(buffer));
              console.log(`💾 生成画像${index + 1}保存完了: ${outputPath}`);
            })
            .catch(err => console.error(`❌ 画像${index + 1}保存エラー:`, err.message));
        }
      });

      // タイミング情報の表示
      if (result.timings) {
        console.log('⏱️ 処理時間:', {
          inference: `${result.timings.inference?.toFixed(2) || '不明'}秒`,
          total: `${((result.timings.inference || 0) + (result.timings.pre_processing || 0))?.toFixed(2)}秒`
        });
      }

      console.log('🎉 Fal AI画像生成テスト成功！');

    } else {
      console.log('⚠️ 生成画像が見つかりません:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Fal AI API呼び出しエラー:', error.message);
    console.error('詳細:', error);
  }
}

// 実行
testFalAI().catch(console.error);