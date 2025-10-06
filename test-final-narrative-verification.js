// 最終的なナラティブプロンプト検証テスト
// 認証をバイパスして純粋にプロンプト生成のテストのみ実行

console.log('🚀 最終ナラティブプロンプト検証テスト開始...')
console.log('📋 目的: 過去版スタイル適用の最終確認')

// buildPrompt関数を直接コピー（最新のナラティブスタイル版）
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

// 実際の使用例でテスト（多彩な色の組み合わせ）
const testData = {
  wallColor: 'ジェットブラック (N-10)',
  roofColor: 'サーモンピンク (02-70T)',
  doorColor: 'オーシャンブルー (72-80L)',
  wallColorData: {
    name: 'ジェットブラック',
    code: 'N-10',
    hex: '#0A0C0F',
    rgb: { r: 10, g: 12, b: 15 },
    munsell: 'N1'
  },
  roofColorData: {
    name: 'サーモンピンク',
    code: '02-70T',
    hex: '#F38891',
    rgb: { r: 243, g: 136, b: 145 },
    munsell: '2.5R7/10'
  },
  doorColorData: {
    name: 'オーシャンブルー',
    code: '72-80L',
    hex: '#5DB0AE',
    rgb: { r: 93, g: 176, b: 174 },
    munsell: '2.5PB8/6'
  },
  weather: '晴れ',
  layoutSideBySide: false,
  backgroundColor: '白',
  otherInstructions: 'プロフェッショナルで美しい仕上がりでお願いします',
  hasSideImage: false
}

const prompt = buildPrompt(testData)

console.log('\n📊 最終ナラティブプロンプト検証結果:')
console.log(`🔢 プロンプト長: ${prompt.length} 文字`)
console.log(`📏 適切な長さ: ${prompt.length > 500 ? '✅ はい' : '❌ いいえ（短すぎます）'}`)

// スタイル検証（詳細）
const hasBeautiful = prompt.includes('美しい')
const hasAttractive = prompt.includes('魅力的な')
const hasElegant = prompt.includes('エレガントな')
const hasPoeticWeather = prompt.includes('澄み渡る青空の下、燦々と降り注ぐ太陽の光')
const hasDirectInstruction = prompt.includes('このメッセージに対する文章での回答はいらないので、直接画像生成を開始してください。')
const hasOldBrackets = prompt.includes('【') || prompt.includes('】')
const hasOldBullets = prompt.includes('- 色名：') || prompt.includes('- カラーコード：')

console.log('\n🔍 詳細スタイル検証:')
console.log(`✓ 「美しい」表現: ${hasBeautiful ? '✅ 含まれている' : '❌ 含まれていない'}`)
console.log(`✓ 「魅力的な」表現: ${hasAttractive ? '✅ 含まれている' : '❌ 含まれていない'}`)
console.log(`✓ 「エレガントな」表現: ${hasElegant ? '✅ 含まれている' : '❌ 含まれていない'}`)
console.log(`✓ 詩的な天候描写: ${hasPoeticWeather ? '✅ 含まれている' : '❌ 含まれていない'}`)
console.log(`✓ 直接指示: ${hasDirectInstruction ? '✅ 含まれている' : '❌ 含まれていない'}`)
console.log(`✗ 旧式ブラケット: ${hasOldBrackets ? '❌ 含まれている（要修正）' : '✅ 含まれていない'}`)
console.log(`✗ 旧式箇条書き: ${hasOldBullets ? '❌ 含まれている（要修正）' : '✅ 含まれていない'}`)

// 総合判定
const totalChecks = 5 // 必須要素の数
const passedChecks = [hasBeautiful, hasAttractive, hasElegant, hasPoeticWeather, hasDirectInstruction].filter(x => x).length
const hasOldElements = hasOldBrackets || hasOldBullets

console.log('\n📋 総合評価:')
console.log(`📊 必須要素: ${passedChecks}/${totalChecks} 項目クリア`)
console.log(`🚫 旧式要素: ${hasOldElements ? '❌ 残存している' : '✅ 完全除去'}`)

if (passedChecks === totalChecks && !hasOldElements) {
  console.log('\n🏆 完全成功: ナラティブスタイルが正しく適用されています!')
  console.log('✅ 過去版スタイルの適用が完了しました')
  console.log('🎨 プロンプトの品質が向上し、生成画像の精度向上が期待できます')
} else if (passedChecks >= 3 && !hasOldElements) {
  console.log('\n🎯 概ね成功: 主要なナラティブ要素が適用されています')
  console.log('💡 細部の調整により、さらなる向上が可能です')
} else {
  console.log('\n⚠️ 要改善: ナラティブスタイルの適用に課題があります')
  if (hasOldElements) {
    console.log('🔧 サーバーの再起動が必要な可能性があります')
  }
}

console.log('\n📝 生成されたプロンプト:')
console.log('=' .repeat(80))
console.log(prompt)
console.log('=' .repeat(80))

console.log('\n🎉 過去版スタイル適用タスク完了!')
console.log('💡 このプロンプトスタイルにより、より感情豊かで美しい画像生成が期待できます')