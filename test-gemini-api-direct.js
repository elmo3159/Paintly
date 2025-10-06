/**
 * Gemini API直接テストスクリプト
 * Paintlyアプリを通さずにGemini APIの動作確認を行う
 */

const fs = require('fs');
const path = require('path');

async function testGeminiAPI() {
  console.log('🧪 Gemini API直接テスト開始...');

  // 環境変数の確認
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.log('❌ GEMINI_API_KEY環境変数が設定されていません');
    return;
  }

  console.log('✅ GEMINI_API_KEY確認完了');

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

  // Gemini APIリクエストペイロード
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `この建物の画像について、以下の変更を行ってください：

            壁の色を変更してください。新しい壁の色は：
            ・R.G.B: 185　0　25
            ・16進数カラーコード: #B90019
            ・マンセル値: 7.5R4/14
            ・日本塗料工業会色番号: 07-40X
            の色に変更してください。

            屋根や他の部分は変更せず、壁の色のみを指定された色に変更してください。
            自然で現実的な仕上がりにしてください。`
          },
          {
            inline_data: {
              mime_type: 'image/png',
              data: base64Image
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    }
  };

  console.log('🚀 Gemini API呼び出し開始...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 API応答ステータス:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API応答エラー:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Gemini API応答受信成功');

    // レスポンスの構造を確認
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        const textParts = candidate.content.parts.filter(part => part.text);
        const imageParts = candidate.content.parts.filter(part => part.inline_data);

        console.log('📝 テキストレスポンス数:', textParts.length);
        console.log('🖼️ 画像レスポンス数:', imageParts.length);

        // テキストレスポンスの表示
        textParts.forEach((part, index) => {
          console.log(`📄 テキスト${index + 1}:`, part.text.substring(0, 200) + '...');
        });

        // 画像レスポンスの処理
        imageParts.forEach((part, index) => {
          console.log(`🖼️ 画像${index + 1}:`, {
            mimeType: part.inline_data.mime_type,
            dataSize: `${(part.inline_data.data.length / 1024).toFixed(2)}KB (base64)`
          });

          // 生成画像を保存
          const outputPath = `./gemini-test-output-${Date.now()}-${index}.png`;
          const imageBuffer = Buffer.from(part.inline_data.data, 'base64');
          fs.writeFileSync(outputPath, imageBuffer);
          console.log(`💾 生成画像保存完了: ${outputPath}`);
        });

        console.log('🎉 Gemini API直接テスト成功！');

      } else {
        console.log('⚠️ 予期しないレスポンス構造:', JSON.stringify(result, null, 2));
      }
    } else {
      console.log('❌ 有効な応答候補が見つかりません:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Gemini API呼び出しエラー:', error.message);
    console.error('詳細:', error);
  }
}

// 実行
testGeminiAPI().catch(console.error);