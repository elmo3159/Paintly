// 詳細プロンプト生成の動作確認テスト
import fs from 'fs'

// buildPrompt関数を直接テスト（route.tsからコピー）
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
  // 🔍 Critical Debug: Check color data before building prompt
  console.log('🎨 BuildPrompt Color Debug:', {
    wallColor,
    wallColorData,
    roofColor,
    roofColorData,
    doorColor,
    doorColorData,
    wallColorDataExists: !!wallColorData,
    wallColorDataKeys: wallColorData ? Object.keys(wallColorData) : null
  })

  // 詳細なプロフェッショナルプロンプト
  let prompt = `この建物の外観を、日本の塗装業界基準に基づいてプロフェッショナルな塗装を施した状態に変更してください。

【塗装仕様】
元の建物の構造、形状、建築的詳細（窓、ドア、屋根の形状、建物のプロポーション）は完全に保持し、塗装色のみを以下の指定色に変更してください：

`

  // 詳細な色指定
  if (wallColor !== '変更なし' && wallColorData) {
    prompt += `外壁塗装：
- 色名：「${wallColorData.name}」
- カラーコード：${wallColorData.hex}
- 日本塗料工業会標準色番号：${wallColorData.code}
- 仕上がり：マット仕上げ、均一なコーティング、塗りムラなし
- 塗装技法：ローラー仕上げまたはスプレー仕上げの高品質な質感

`
  }

  if (roofColor !== '変更なし' && roofColorData) {
    prompt += `屋根塗装：
- 色名：「${roofColorData.name}」
- カラーコード：${roofColorData.hex}
- 日本塗料工業会標準色番号：${roofColorData.code}
- 仕上がり：耐候性塗料による保護的なコーティング
- 材質感：元の屋根材（瓦、金属、スレートなど）の質感を維持

`
  }

  if (doorColor !== '変更なし' && doorColorData) {
    prompt += `ドア・建具塗装：
- 色名：「${doorColorData.name}」
- カラーコード：${doorColorData.hex}
- 日本塗料工業会標準色番号：${doorColorData.code}
- 仕上がり：セミグロス仕上げ、滑らかで上品な質感
- 詳細：ドアハンドル、ヒンジなどの金具は元の色を維持

`
  }

  // 詳細な天候・照明設定
  const weatherInstructions = {
    '変更なし': '自然な昼間の明るい照明、やわらかな陰影で建物の立体感を強調',
    '晴れ': '快晴の明るい日光、明確な陰影、青空背景、建物にくっきりとした光と影のコントラスト',
    '曇り': '曇天の均一で柔らかな照明、陰影は控えめ、グレーがかった空、建物全体が均等に照らされた状態',
    '雨': '雨天の暗めの照明、濡れた表面の質感、反射光、雨粒の効果、しっとりとした雰囲気',
    '雪': '雪景色の冬の照明、雪化粧した周辺環境、柔らかな白い光、建物周辺に雪の積もった風景'
  }

  prompt += `【環境・照明設定】
${weatherInstructions[weather] || weatherInstructions['変更なし']}

`

  // サイドバイサイドレイアウトの詳細指示
  if (layoutSideBySide) {
    const backgroundColorMap = {
      '白': '純白（#FFFFFF）',
      '黒': '深黒（#000000）',
      '薄ピンク': '薄いピンク（#FFF0F5）'
    }
    const backgroundDescription = backgroundColorMap[backgroundColor] || '純白（#FFFFFF）'

    prompt += `【レイアウト指示】
この塗装済み建物を背景から完全に切り抜き、${backgroundDescription}の無地背景に配置してください。`

    if (hasSideImage) {
      prompt += `
正面画像と横面画像を左右に並べて配置し、1枚の画像として合成してください。
- 左側：塗装後の正面画像
- 右側：塗装後の横面画像（ユーザー提供画像ベース）
- 配置：中央揃え、適切な間隔を開けて配置
- 背景：統一された${backgroundDescription}

`
    } else {
      prompt += `
正面画像と、AIで生成した横面画像を左右に並べて配置してください。
- 左側：塗装後の正面画像
- 右側：同じ建物の横面ビュー（AI生成、塗装仕様は正面と同じ）
- 配置：中央揃え、適切な間隔を開けて配置
- 背景：統一された${backgroundDescription}

`
    }
  } else {
    prompt += `【通常レイアウト】
元の建物の構図、角度、視点を完全に維持し、塗装色のみを変更してください。
周辺環境（植栽、道路、空など）も元の状態を保持してください。

`
  }

  // 品質・技術仕様
  prompt += `【品質・技術仕様】
- 解像度：高解像度（最低1024x1024ピクセル相当の品質）
- 画質：写真レベルのフォトリアリスティック仕上げ
- 色精度：指定されたカラーコードに正確に一致
- 塗装仕上がり：プロの塗装職人による完璧な仕上がり
- 細部：窓枠、雨樋、換気口などの細部も適切に塗装
- 陰影：自然な光の当たり方による立体感
- 質感：各素材（外壁材、屋根材、建具）の本来の質感を維持

【保持すべき要素】
- 建物の形状・プロポーション
- 窓・ドアの位置とサイズ
- 屋根の形状と角度
- 建築的な装飾やディテール
- 周辺の植栽や構造物（並べて表示でない場合）
- 元の構図と視点

`

  // 顧客からの追加指示
  if (otherInstructions && otherInstructions.trim()) {
    prompt += `【お客様からの追加ご要望】
${otherInstructions}

`
  }

  // 最終的な品質指示
  prompt += `【最終確認事項】
塗装業界のプロフェッショナル基準に基づき、実際の塗装工事後の建物外観を忠実に再現してください。
顧客への提案資料として使用するため、商業レベルの高品質な仕上がりを実現してください。
すべての色は指定された日本塗料工業会標準色に正確に一致させ、塗装のムラや不自然な部分は一切ないようにしてください。`

  return prompt
}

async function testPromptGeneration() {
  try {
    console.log('🚀 詳細プロンプト生成テスト開始...')

    // テストデータ
    const testData = {
      wallColor: 'ジェットブラック (N-10)',
      roofColor: 'チェリーレッド (07-40X)',
      doorColor: 'ビビッドピンク (95-70P)',
      wallColorData: {
        name: 'ジェットブラック',
        code: 'N-10',
        hex: '#0A0C0F',
        rgb: { r: 10, g: 12, b: 15 },
        munsell: 'N1'
      },
      roofColorData: {
        name: 'チェリーレッド',
        code: '07-40X',
        hex: '#B90019',
        rgb: { r: 185, g: 0, b: 25 },
        munsell: '7.5R4/14'
      },
      doorColorData: {
        name: 'ビビッドピンク',
        code: '95-70P',
        hex: '#C257A3',
        rgb: { r: 194, g: 87, b: 163 },
        munsell: '5RP7/8'
      },
      weather: '変更なし',
      layoutSideBySide: false,
      backgroundColor: '白',
      otherInstructions: 'プロフェッショナルな仕上がりでお願いします',
      hasSideImage: false
    }

    const prompt = buildPrompt(testData)

    console.log('\n📊 プロンプト生成結果:')
    console.log(`🔢 プロンプト長: ${prompt.length} 文字`)
    console.log('\n📝 生成されたプロンプト:')
    console.log('=' * 80)
    console.log(prompt)
    console.log('=' * 80)

    if (prompt.length > 800) {
      console.log('✅ 成功: 詳細プロンプト（800文字以上）が正常に生成されました')
    } else {
      console.log('❌ 問題: プロンプトが短すぎます (期待: 800文字以上)')
    }

    // プロンプトの内容チェック
    const hasDetailedInstructions = prompt.includes('日本の塗装業界基準')
    const hasColorDetails = prompt.includes('日本塗料工業会標準色番号')
    const hasQualitySpecs = prompt.includes('品質・技術仕様')

    console.log('\n🔍 プロンプト品質チェック:')
    console.log(`✓ 詳細な業界基準: ${hasDetailedInstructions ? '含まれている' : '含まれていない'}`)
    console.log(`✓ 色の詳細情報: ${hasColorDetails ? '含まれている' : '含まれていない'}`)
    console.log(`✓ 品質仕様: ${hasQualitySpecs ? '含まれている' : '含まれていない'}`)

    if (hasDetailedInstructions && hasColorDetails && hasQualitySpecs) {
      console.log('\n🎉 完全成功: すべての詳細情報が含まれた高品質プロンプトが生成されました')
    } else {
      console.log('\n⚠️ 部分的成功: いくつかの詳細情報が不足している可能性があります')
    }

  } catch (error) {
    console.error('❌ テストエラー:', error.message)
  }
}

testPromptGeneration()