// ナラティブスタイルプロンプトの動作確認テスト
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

// buildPrompt関数を直接コピー（route.tsから）
function buildPrompt({
  wallColor,
  roofColor,
  doorColor,
  wallColorData,
  roofColorData,
  doorColorData,
  weather,
  layoutSideBySide,
  backgroundColor,
  otherInstructions,
  hasSideImage
}) {
  // ナラティブスタイルの感情豊かなプロンプト
  let prompt = 'この建物を指定された色でプロフェッショナルに塗装した後の詳細で写実的な画像を生成してください。'
  prompt += '元の建物の構造、形状、建築的詳細は完全に保持しながら、以下の指定通りに美しく塗装してください。\n\n'

  // 色の指定（ナラティブスタイル）
  if (wallColor !== '変更なし' && wallColorData) {
    prompt += `建物の外壁は美しい「${wallColorData.name}」色で塗装してください。`
    prompt += `この色は正確に${wallColorData.hex}のカラーコードで表現され、`
    prompt += `日本塗料工業会の標準色番号${wallColorData.code}として規定されている色です。`
    prompt += `外壁全体に均一で滑らかなマット仕上げを施し、プロフェッショナルな塗装技術による完璧な仕上がりを表現してください。\n\n`
  }

  if (roofColor !== '変更なし' && roofColorData) {
    prompt += `屋根は魅力的な「${roofColorData.name}」色で丁寧に塗装してください。`
    prompt += `この色は${roofColorData.hex}のカラーコードを持ち、`
    prompt += `日本塗料工業会標準色番号${roofColorData.code}として認定されています。`
    prompt += `屋根材の質感を活かしながら、耐候性の高い塗料で保護された美しい仕上がりを実現してください。\n\n`
  }

  if (doorColor !== '変更なし' && doorColorData) {
    prompt += `ドアと建具はエレガントな「${doorColorData.name}」色で塗装してください。`
    prompt += `この色は${doorColorData.hex}として定義され、`
    prompt += `日本塗料工業会の色番号${doorColorData.code}に準拠しています。`
    prompt += `セミグロスの上品な光沢で、滑らかで美しい仕上がりにしてください。ドアハンドルやヒンジなどの金具は元の色を維持してください。\n\n`
  }

  // 天候と照明（詩的な表現）
  const weatherNarrative = {
    '変更なし': '自然な昼間の優しい光の中で、建物の美しさが最も引き立つように表現してください。やわらかな陰影が建物の立体感を際立たせ、塗装の質感が美しく見えるようにしてください。',
    '晴れ': '澄み渡る青空の下、燦々と降り注ぐ太陽の光が建物を明るく照らしています。くっきりとした影が建物の立体感を強調し、塗装の鮮やかな色彩が輝いて見えるようにしてください。',
    '曇り': '穏やかな曇り空の下、柔らかで均一な光が建物全体を包み込んでいます。影は控えめですが、塗装の質感と色合いが優しく表現される絶好の条件です。',
    '雨': '雨に濡れた建物の表面が、しっとりとした美しさを醸し出しています。塗装面に雨粒が流れ、濡れた質感が建物に深みと趣を与えています。雨の日特有の柔らかな光が、塗装の色を優しく引き立てます。',
    '雪': '雪化粧をした幻想的な風景の中で、建物が静かに佇んでいます。屋根や周辺に積もった雪が、塗装された建物の色彩をより一層引き立て、冬の美しい情景を作り出しています。'
  }

  prompt += weatherNarrative[weather] || weatherNarrative['変更なし']
  prompt += '\n\n'

  // レイアウト指示（ナラティブスタイル）
  if (layoutSideBySide) {
    const backgroundNarrative = {
      '白': '純白',
      '黒': '深い黒',
      '薄ピンク': '優しい薄ピンク'
    }
    const bgDescription = backgroundNarrative[backgroundColor] || '純白'

    prompt += `この美しく塗装された建物を、${bgDescription}の背景に切り抜いて配置してください。`

    if (hasSideImage) {
      prompt += `正面からの視点と横からの視点を左右に並べ、一枚の画像として美しく構成してください。`
      prompt += `左側には正面から見た塗装後の建物、右側にはユーザーが提供した横からの視点を同じ塗装仕様で表現してください。`
    } else {
      prompt += `正面からの視点と、AIが生成した横からの視点を左右に並べて、一枚の画像として美しく構成してください。`
      prompt += `両方の視点で同じ塗装仕様が適用され、統一感のある美しい仕上がりにしてください。`
    }
    prompt += '\n\n'
  } else {
    prompt += '元の構図と視点を完全に維持し、周辺の環境も含めて自然に表現してください。\n\n'
  }

  // 追加指示
  if (otherInstructions && otherInstructions.trim()) {
    prompt += `さらに、以下の点にも配慮してください：${otherInstructions}\n\n`
  }

  // 品質に関する最終指示（ナラティブ）
  prompt += '画像は高解像度で写実的に、実際の塗装工事を行った後の建物の外観を忠実に再現してください。'
  prompt += '色彩は指定されたカラーコードに正確に一致させ、塗装のムラや不自然な部分が一切ない、'
  prompt += 'プロフェッショナルな塗装職人による完璧な仕上がりを表現してください。'
  prompt += '建物の細部まで丁寧に塗装され、窓枠、雨樋、換気口などの要素も適切に処理されている状態を表現してください。\n\n'

  // Fal AI向けの直接指示
  prompt += 'このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。'

  return prompt
}

async function testNarrativePrompt() {
  try {
    console.log('🚀 ナラティブスタイルプロンプトテスト開始...')

    // テストデータ（実際の使用例）
    const testData = {
      wallColor: 'ライトブルー (62-90A)',
      roofColor: 'ダークグレー (N-40)',
      doorColor: 'ホワイト (N-93)',
      wallColorData: {
        name: 'ライトブルー',
        code: '62-90A',
        hex: '#D1E5E1',
        rgb: { r: 209, g: 229, b: 225 },
        munsell: '2.5BG 9/1'
      },
      roofColorData: {
        name: 'ダークグレー',
        code: 'N-40',
        hex: '#5A5A5A',
        rgb: { r: 90, g: 90, b: 90 },
        munsell: 'N4'
      },
      doorColorData: {
        name: 'ホワイト',
        code: 'N-93',
        hex: '#E5E5E3',
        rgb: { r: 229, g: 229, b: 227 },
        munsell: 'N9.3'
      },
      weather: '晴れ',
      layoutSideBySide: false,
      backgroundColor: '白',
      otherInstructions: 'プロフェッショナルな仕上がりでお願いします',
      hasSideImage: false
    }

    const prompt = buildPrompt(testData)

    console.log('\n📊 ナラティブスタイルプロンプト生成結果:')
    console.log(`🔢 プロンプト長: ${prompt.length} 文字`)
    console.log('\n📝 生成されたプロンプト:')
    console.log('=' .repeat(80))
    console.log(prompt)
    console.log('=' .repeat(80))

    // スタイルチェック
    const hasNarrativeStyle = prompt.includes('美しい') || prompt.includes('魅力的な') || prompt.includes('エレガントな')
    const hasPoeticWeather = prompt.includes('澄み渡る青空の下')
    const hasDirectInstruction = prompt.includes('このメッセージに対する文章での回答はいらないので')
    const hasFlowingText = !prompt.includes('【') && !prompt.includes('】') && !prompt.includes('- ')

    console.log('\n🔍 ナラティブスタイル品質チェック:')
    console.log(`✓ 感情豊かな表現: ${hasNarrativeStyle ? '含まれている' : '含まれていない'}`)
    console.log(`✓ 詩的な天候描写: ${hasPoeticWeather ? '含まれている' : '含まれていない'}`)
    console.log(`✓ 直接指示: ${hasDirectInstruction ? '含まれている' : '含まれていない'}`)
    console.log(`✓ 流れるような文章: ${hasFlowingText ? 'はい（構造的な記号なし）' : 'いいえ（構造的な記号あり）'}`)

    if (hasNarrativeStyle && hasPoeticWeather && hasDirectInstruction) {
      console.log('\n🎉 成功: ナラティブスタイルのプロンプトが正しく生成されました!')
      console.log('📌 過去版スタイルの適用が完了しました')
    } else {
      console.log('\n⚠️ 警告: 一部のナラティブ要素が不足している可能性があります')
    }

  } catch (error) {
    console.error('❌ テストエラー:', error.message)
  }
}

testNarrativePrompt()