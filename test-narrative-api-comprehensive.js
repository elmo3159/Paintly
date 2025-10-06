// 包括的ナラティブプロンプト API テスト
import { fal } from '@fal-ai/client'
import fs from 'fs'
import fetch from 'node-fetch'

async function testNarrativeAPIComprehensive() {
  try {
    console.log('🚀 ナラティブプロンプト包括的APIテスト開始...')
    console.log('📍 目的: 過去版スタイル適用後の詳細プロンプト検証')

    // テスト画像読み込み
    const imagePath = './Gemini_Generated_Image_yyuqo2yyuqo2yyuq.png'
    console.log(`📁 テスト画像読み込み: ${imagePath}`)

    const imageBuffer = fs.readFileSync(imagePath)
    console.log(`📏 画像サイズ: ${(imageBuffer.length / 1024).toFixed(2)} KB`)

    // FormDataを準備（実際のフロントエンドと同じ形式）
    const formData = new FormData()

    // 画像ファイルを追加
    const imageFile = new File([imageBuffer], 'test-building.png', { type: 'image/png' })
    formData.append('mainImage', imageFile)

    // テストパラメータ（ナラティブプロンプトに最適化）
    formData.append('customerId', 'test-narrative-customer-' + Date.now())
    formData.append('wallColor', 'ライトブルー (62-90A)')
    formData.append('roofColor', 'チェリーレッド (07-40X)')
    formData.append('doorColor', 'エレガントホワイト (N-93)')

    // 詳細な色データ（ナラティブプロンプトに必要）
    formData.append('wallColorData', JSON.stringify({
      name: 'ライトブルー',
      code: '62-90A',
      hex: '#D1E5E1',
      rgb: { r: 209, g: 229, b: 225 },
      munsell: '2.5BG 9/1'
    }))

    formData.append('roofColorData', JSON.stringify({
      name: 'チェリーレッド',
      code: '07-40X',
      hex: '#B90019',
      rgb: { r: 185, g: 0, b: 25 },
      munsell: '7.5R4/14'
    }))

    formData.append('doorColorData', JSON.stringify({
      name: 'エレガントホワイト',
      code: 'N-93',
      hex: '#E5E5E3',
      rgb: { r: 229, g: 229, b: 227 },
      munsell: 'N9.3'
    }))

    // その他のパラメータ
    formData.append('weather', '晴れ')  // 詩的な天候描写をテスト
    formData.append('layoutSideBySide', 'false')
    formData.append('backgroundColor', '白')
    formData.append('otherInstructions', 'プロフェッショナルで美しい仕上がりでお願いします')

    console.log('📤 localhost:9090/api/generate へリクエスト送信中...')
    console.log('🔍 テスト対象: ナラティブスタイルプロンプト生成')

    const apiResponse = await fetch('http://localhost:9090/api/generate', {
      method: 'POST',
      body: formData
    })

    if (apiResponse.ok) {
      const apiResult = await apiResponse.json()
      console.log('🎯 API呼び出し成功!')

      // レスポンス詳細分析
      console.log('\n📊 API応答の詳細分析:')
      console.log('✅ ステータス: 成功')
      console.log(`📷 生成画像URL: ${apiResult.generated_image_url ? '生成済み' : '未生成'}`)
      console.log(`🆔 履歴ID: ${apiResult.history_id || 'なし'}`)

      if (apiResult.generated_image_url) {
        console.log(`🔗 生成画像URL: ${apiResult.generated_image_url}`)
        console.log('\n🎉 包括テスト成功: ナラティブプロンプトでの画像生成が完了しました!')
      }

      if (apiResult.debug_info) {
        console.log('\n🔍 デバッグ情報:')
        console.log(`📝 プロンプト長: ${apiResult.debug_info.prompt_length || '不明'} 文字`)

        // プロンプトのスタイルチェック
        if (apiResult.debug_info.prompt) {
          const prompt = apiResult.debug_info.prompt
          const hasNarrativeStyle = prompt.includes('美しい') || prompt.includes('魅力的な') || prompt.includes('エレガントな')
          const hasPoeticWeather = prompt.includes('澄み渡る青空') || prompt.includes('燦々と降り注ぐ')
          const hasDirectInstruction = prompt.includes('このメッセージに対する文章での回答はいらないので')
          const hasOldStructure = prompt.includes('【') || prompt.includes('】') || prompt.includes('- ')

          console.log('\n📋 プロンプトスタイル検証:')
          console.log(`✓ ナラティブ表現: ${hasNarrativeStyle ? '含まれている ✅' : '含まれていない ❌'}`)
          console.log(`✓ 詩的な天候描写: ${hasPoeticWeather ? '含まれている ✅' : '含まれていない ❌'}`)
          console.log(`✓ 直接指示: ${hasDirectInstruction ? '含まれている ✅' : '含まれていない ❌'}`)
          console.log(`✓ 旧構造記号: ${hasOldStructure ? '含まれている ❌（要修正）' : '含まれていない ✅'}`)

          if (hasNarrativeStyle && hasPoeticWeather && hasDirectInstruction && !hasOldStructure) {
            console.log('\n🏆 完全成功: ナラティブスタイルが正しく適用されています!')
          } else {
            console.log('\n⚠️ 部分的成功: プロンプトスタイルの一部に課題があります')
            console.log('🔧 サーバーの再起動が必要な可能性があります')
          }
        }
      }

    } else {
      console.log(`❌ API呼び出し失敗: ${apiResponse.status} ${apiResponse.statusText}`)
      const errorText = await apiResponse.text()
      console.log(`🔍 エラー詳細: ${errorText}`)

      if (apiResponse.status === 401) {
        console.log('🔑 認証エラー: Google認証が必要です')
      } else if (apiResponse.status === 500) {
        console.log('🔧 サーバーエラー: 設定または実装に問題があります')
      }
    }

    // 最終レポート
    console.log('\n📋 === ナラティブプロンプト包括テスト結果サマリー ===')
    console.log('✅ API接続テスト: 完了')
    console.log('✅ FormData送信: 完了')
    console.log('✅ 詳細色データ: 送信済み')
    console.log('🎨 ナラティブプロンプト: 検証実行')
    console.log('📷 画像生成: テスト実行')
    console.log('\n💡 過去版スタイルの適用状況を上記の検証結果で確認してください')

  } catch (error) {
    console.error('❌ 包括的テストエラー:', error.message)
    console.error('🔍 エラー詳細:', {
      message: error.message,
      stack: error.stack?.split('\n')[0] || 'スタック情報なし'
    })
  }
}

testNarrativeAPIComprehensive()