export interface PaintColor {
  id: string
  name: string
  code: string // 日塗工番号
  hex: string
  rgb: { r: number; g: number; b: number }
  munsell?: string
  difficulty?: '□' | '◆' // 出にくい色の記号
}

export interface ColorSubcategory {
  id: string
  name: string
  colors: PaintColor[]
}

export interface ColorCategory {
  id: string
  name: string
  description: string
  hex: string // カテゴリ代表色
  subcategories: ColorSubcategory[]
}

// 使用用途に応じた推奨カテゴリ
export type ColorUsage = 'wall' | 'roof' | 'door'

// カテゴリごとの具体的な色データ（PDF 14ページ全色収録）
export const colorHierarchy: ColorCategory[] = [
  {
    id: 'neutral',
    name: 'ニュートラル',
    description: '無彩色系（白・グレー・黒）',
    hex: '#A9AAA8',
    subcategories: [
      {
        id: 'whites',
        name: 'ホワイト系',
        colors: [
          { id: 'n-95', name: 'スーパーホワイト', code: 'N-95', hex: '#F5F7F2', rgb: { r: 245, g: 247, b: 242 }, munsell: 'N9.5', difficulty: '◆' },
          { id: 'n-93', name: 'パールホワイト', code: 'N-93', hex: '#EEEDE6', rgb: { r: 238, g: 237, b: 230 }, munsell: 'N9.3' },
          { id: 'n-90', name: 'オフホワイト', code: 'N-90', hex: '#E6E4DC', rgb: { r: 230, g: 228, b: 220 }, munsell: 'N9' },
          { id: 'n-87', name: 'アイボリー', code: 'N-87', hex: '#DFDEDC', rgb: { r: 223, g: 222, b: 216 }, munsell: 'N8.7' },
          { id: 'n-85', name: 'クリームホワイト', code: 'N-85', hex: '#D7D7D2', rgb: { r: 215, g: 215, b: 210 }, munsell: 'N8.5' }
        ]
      },
      {
        id: 'light-grays',
        name: 'ライトグレー系',
        colors: [
          { id: 'n-82', name: 'ライトグレー', code: 'N-82', hex: '#D0D0CC', rgb: { r: 208, g: 208, b: 204 }, munsell: 'N8.2' },
          { id: 'n-80', name: 'シルバーグレー', code: 'N-80', hex: '#C8C9C5', rgb: { r: 200, g: 201, b: 197 }, munsell: 'N8' },
          { id: 'n-77', name: 'パールグレー', code: 'N-77', hex: '#BFC1BE', rgb: { r: 191, g: 193, b: 190 }, munsell: 'N7.7' },
          { id: 'n-75', name: 'ソフトグレー', code: 'N-75', hex: '#B7B9B7', rgb: { r: 183, g: 185, b: 183 }, munsell: 'N7.5' },
          { id: 'n-72', name: 'ミストグレー', code: 'N-72', hex: '#B0B1AF', rgb: { r: 176, g: 177, b: 175 }, munsell: 'N7.2' },
          { id: 'n-70', name: 'クラウドグレー', code: 'N-70', hex: '#A9AAA8', rgb: { r: 169, g: 170, b: 168 }, munsell: 'N7' }
        ]
      },
      {
        id: 'medium-grays',
        name: 'ミディアムグレー系',
        colors: [
          { id: 'n-67', name: 'ミディアムグレー', code: 'N-67', hex: '#A2A3A1', rgb: { r: 162, g: 163, b: 161 }, munsell: 'N6.7' },
          { id: 'n-65', name: 'スモークグレー', code: 'N-65', hex: '#9A9A98', rgb: { r: 154, g: 154, b: 152 }, munsell: 'N6.5' },
          { id: 'n-60', name: 'アッシュグレー', code: 'N-60', hex: '#8F908E', rgb: { r: 143, g: 144, b: 142 }, munsell: 'N6' },
          { id: 'n-55', name: 'ダブグレー', code: 'N-55', hex: '#828483', rgb: { r: 130, g: 132, b: 131 }, munsell: 'N5.5' },
          { id: 'n-50', name: 'グレー', code: 'N-50', hex: '#727575', rgb: { r: 114, g: 117, b: 117 }, munsell: 'N5' }
        ]
      },
      {
        id: 'dark-grays',
        name: 'ダークグレー系',
        colors: [
          { id: 'n-45', name: 'ダークグレー', code: 'N-45', hex: '#636667', rgb: { r: 99, g: 102, b: 103 }, munsell: 'N4.5' },
          { id: 'n-40', name: 'チャコールグレー', code: 'N-40', hex: '#56595A', rgb: { r: 86, g: 89, b: 90 }, munsell: 'N4' },
          { id: 'n-35', name: 'スレートグレー', code: 'N-35', hex: '#4B4D4F', rgb: { r: 75, g: 77, b: 79 }, munsell: 'N3.5' },
          { id: 'n-30', name: 'アンスラサイト', code: 'N-30', hex: '#3F4244', rgb: { r: 63, g: 66, b: 68 }, munsell: 'N3' },
          { id: 'n-25', name: 'ガンメタル', code: 'N-25', hex: '#373838', rgb: { r: 55, g: 56, b: 56 }, munsell: 'N2.5', difficulty: '□' }
        ]
      },
      {
        id: 'blacks',
        name: 'ブラック系',
        colors: [
          { id: 'n-20', name: 'アイアンブラック', code: 'N-20', hex: '#2D2D2F', rgb: { r: 45, g: 45, b: 47 }, munsell: 'N2', difficulty: '□' },
          { id: 'n-15', name: 'オニキスブラック', code: 'N-15', hex: '#232426', rgb: { r: 35, g: 36, b: 38 }, munsell: 'N1.5', difficulty: '□' },
          { id: 'n-10', name: 'ジェットブラック', code: 'N-10', hex: '#0A0C0F', rgb: { r: 10, g: 12, b: 15 }, munsell: 'N1', difficulty: '◆' }
        ]
      }
    ]
  },
  {
    id: 'red',
    name: 'レッド',
    description: '赤系統の色',
    hex: '#B90019',
    subcategories: [
      {
        id: 'light-reds',
        name: 'ライトレッド系',
        colors: [
          { id: '02-80h', name: 'ライトピンク', code: '02-80H', hex: '#E9B8B9', rgb: { r: 233, g: 184, b: 185 }, munsell: '2.5R8/4' },
          { id: '02-80l', name: 'ローズピンク', code: '02-80L', hex: '#F3B0B2', rgb: { r: 243, g: 176, b: 178 }, munsell: '2.5R8/6', difficulty: '□' },
          { id: '05-92b', name: 'パウダーピンク', code: '05-92B', hex: '#F2E8E5', rgb: { r: 242, g: 232, b: 229 }, munsell: '5R9.2/1' },
          { id: '05-90b', name: 'シェルピンク', code: '05-90B', hex: '#F0E6E0', rgb: { r: 240, g: 230, b: 224 }, munsell: '5R9/1' },
          { id: '05-90a', name: 'ローズベージュ', code: '05-90A', hex: '#E9E5DF', rgb: { r: 233, g: 229, b: 223 }, munsell: '5R9/0.5' },
          { id: '05-85a', name: 'ライトローズ', code: '05-85A', hex: '#DBD6D2', rgb: { r: 219, g: 214, b: 210 }, munsell: '5R8.5/0.5' },
          { id: '05-85b', name: 'ローズグレー', code: '05-85B', hex: '#DFD5D1', rgb: { r: 223, g: 213, b: 209 }, munsell: '5R8.5/1' },
          { id: '05-80a', name: 'ブラッシュ', code: '05-80A', hex: '#CEC9C5', rgb: { r: 206, g: 201, b: 197 }, munsell: '5R8/0.5' },
          { id: '05-80b', name: 'ピンクベージュ', code: '05-80B', hex: '#D3C8C4', rgb: { r: 211, g: 200, b: 196 }, munsell: '5R8/1' },
          { id: '05-90d', name: 'ピーチピンク', code: '05-90D', hex: '#F7DCD8', rgb: { r: 247, g: 220, b: 216 }, munsell: '5R9/2' }
        ]
      },
      {
        id: 'medium-reds',
        name: 'ミディアムレッド系',
        colors: [
          { id: '02-70t', name: 'サーモンピンク', code: '02-70T', hex: '#F38891', rgb: { r: 243, g: 136, b: 145 }, munsell: '2.5R7/10', difficulty: '◆' },
          { id: '02-60h', name: 'ダスティローズ', code: '02-60H', hex: '#B28587', rgb: { r: 178, g: 133, b: 135 }, munsell: '2.5R6/4' },
          { id: '05-80l', name: 'コーラルピンク', code: '05-80L', hex: '#FCB2AE', rgb: { r: 252, g: 178, b: 174 }, munsell: '5R8/6', difficulty: '◆' },
          { id: '05-70l', name: 'フラミンゴピンク', code: '05-70L', hex: '#E09896', rgb: { r: 224, g: 152, b: 150 }, munsell: '5R7/6' },
          { id: '05-60l', name: 'カーマイン', code: '05-60L', hex: '#C57C79', rgb: { r: 197, g: 124, b: 121 }, munsell: '5R6/6' },
          { id: '05-60f', name: 'ローズタン', code: '05-60F', hex: '#AB8987', rgb: { r: 171, g: 137, b: 135 }, munsell: '5R6/3' },
          { id: '07-70f', name: 'ロゼ', code: '07-70F', hex: '#C49F97', rgb: { r: 196, g: 159, b: 151 }, munsell: '7.5R7/3' },
          { id: '07-60h', name: 'テラコッタローズ', code: '07-60H', hex: '#B5827D', rgb: { r: 181, g: 130, b: 125 }, munsell: '7.5R6/4', difficulty: '□' },
          { id: '07-70l', name: 'サンセットピンク', code: '07-70L', hex: '#E3988E', rgb: { r: 227, g: 152, b: 142 }, munsell: '7.5R7/6' },
          { id: '07-80h', name: 'アプリコット', code: '07-80H', hex: '#EBB9B1', rgb: { r: 235, g: 185, b: 177 }, munsell: '7.5R8/4' }
        ]
      },
      {
        id: 'deep-reds',
        name: 'ディープレッド系',
        colors: [
          { id: '07-50l', name: 'ブリックレッド', code: '07-50L', hex: '#AA6159', rgb: { r: 170, g: 97, b: 89 }, munsell: '7.5R5/6', difficulty: '□' },
          { id: '07-40p', name: 'スカーレット', code: '07-40P', hex: '#953D37', rgb: { r: 149, g: 61, b: 55 }, munsell: '7.5R4/8', difficulty: '□' },
          { id: '07-40x', name: 'チェリーレッド', code: '07-40X', hex: '#B90019', rgb: { r: 185, g: 0, b: 25 }, munsell: '7.5R4/14', difficulty: '□' },
          { id: '09-60l', name: 'クリムゾン', code: '09-60L', hex: '#C47B6A', rgb: { r: 196, g: 123, b: 106 }, munsell: '10R6/6' },
          { id: '09-50l', name: 'ルビーレッド', code: '09-50L', hex: '#A9604E', rgb: { r: 169, g: 96, b: 78 }, munsell: '10R5/6' },
          { id: '09-60h', name: 'インディアンレッド', code: '09-60H', hex: '#B68374', rgb: { r: 182, g: 131, b: 116 }, munsell: '10R6/4' },
          { id: '09-70h', name: 'テラコッタ', code: '09-70H', hex: '#D2A195', rgb: { r: 210, g: 161, b: 149 }, munsell: '10R7/4' },
          { id: '09-70t', name: 'ヴァーミリオン', code: '09-70T', hex: '#FB8566', rgb: { r: 251, g: 133, b: 102 }, munsell: '10R7/10', difficulty: '◆' }
        ]
      },
      {
        id: 'dark-reds',
        name: 'ダークレッド系',
        colors: [
          { id: '05-50f', name: 'ローズウッド', code: '05-50F', hex: '#92706E', rgb: { r: 146, g: 112, b: 110 }, munsell: '5R5/3' },
          { id: '05-40f', name: 'ダークレッド', code: '05-40F', hex: '#7D5555', rgb: { r: 125, g: 85, b: 85 }, munsell: '5R4/3' },
          { id: '05-30d', name: 'ワインレッド', code: '05-30D', hex: '#543938', rgb: { r: 84, g: 57, b: 56 }, munsell: '5R3/2', difficulty: '□' },
          { id: '05-20b', name: 'マルーン', code: '05-20B', hex: '#2E1E1E', rgb: { r: 46, g: 30, b: 30 }, munsell: '5R2/1', difficulty: '□' },
          { id: '07-30l', name: 'ブラッドレッド', code: '07-30L', hex: '#712A24', rgb: { r: 113, g: 42, b: 36 }, munsell: '7.5R3/6', difficulty: '□' },
          { id: '07-30f', name: 'ディープマホガニー', code: '07-30F', hex: '#633733', rgb: { r: 99, g: 55, b: 51 }, munsell: '7.5R3/3', difficulty: '□' },
          { id: '07-20h', name: 'ダークマルーン', code: '07-20H', hex: '#461A19', rgb: { r: 70, g: 26, b: 25 }, munsell: '7.5R2/4', difficulty: '□' },
          { id: '09-40l', name: 'バーガンディ', code: '09-40L', hex: '#8C4335', rgb: { r: 140, g: 67, b: 53 }, munsell: '10R4/6', difficulty: '□' },
          { id: '09-40h', name: 'ブラウンレッド', code: '09-40H', hex: '#804E43', rgb: { r: 128, g: 78, b: 67 }, munsell: '10R4/4', difficulty: '□' },
          { id: '09-30h', name: 'ディープブラウン', code: '09-30H', hex: '#66362A', rgb: { r: 102, g: 54, b: 42 }, munsell: '10R3/4', difficulty: '□' },
          { id: '09-30l', name: 'ディープクリムゾン', code: '09-30L', hex: '#742C1C', rgb: { r: 116, g: 44, b: 28 }, munsell: '10R3/6', difficulty: '□' },
          { id: '09-20d', name: 'ダークバーガンディ', code: '09-20D', hex: '#3D1E19', rgb: { r: 61, g: 30, b: 25 }, munsell: '10R2/2', difficulty: '◆' }
        ]
      }
    ]
  },
  {
    id: 'orange',
    name: 'オレンジ',
    description: 'オレンジ系統の色',
    hex: '#E67318',
    subcategories: [
      {
        id: 'light-oranges',
        name: 'ライトオレンジ系',
        colors: [
          { id: '12-80f', name: 'ピーチ', code: '12-80F', hex: '#E7BFB1', rgb: { r: 231, g: 191, b: 177 }, munsell: '2.5YR8/3' },
          { id: '12-80h', name: 'アプリコット', code: '12-80H', hex: '#EFBBA6', rgb: { r: 239, g: 187, b: 166 }, munsell: '2.5YR8/4' },
          { id: '12-90d', name: 'パールオレンジ', code: '12-90D', hex: '#F7DED4', rgb: { r: 247, g: 222, b: 212 }, munsell: '2.5YR9/2' },
          { id: '15-90a', name: 'ライトピーチ', code: '15-90A', hex: '#ECE5DE', rgb: { r: 236, g: 229, b: 222 }, munsell: '5YR9/0.5' },
          { id: '15-85a', name: 'ウォームホワイト', code: '15-85A', hex: '#DED7D0', rgb: { r: 222, g: 215, b: 208 }, munsell: '5YR8.5/0.5' },
          { id: '15-80a', name: 'ウォームベージュ', code: '15-80A', hex: '#D2CAC3', rgb: { r: 210, g: 202, b: 195 }, munsell: '5YR8/0.5' },
          { id: '15-92b', name: 'ピンクベージュ', code: '15-92B', hex: '#F1E5DA', rgb: { r: 241, g: 229, b: 218 }, munsell: '5YR9.2/1' },
          { id: '15-90b', name: 'サンドベージュ', code: '15-90B', hex: '#EBE1D6', rgb: { r: 235, g: 225, b: 214 }, munsell: '5YR9/1' },
          { id: '15-90d', name: 'パールベージュ', code: '15-90D', hex: '#FAE2D3', rgb: { r: 250, g: 226, b: 211 }, munsell: '5YR9/2' }
        ]
      },
      {
        id: 'medium-oranges',
        name: 'ミディアムオレンジ系',
        colors: [
          { id: '12-70l', name: 'パーシモン', code: '12-70L', hex: '#DE957A', rgb: { r: 222, g: 149, b: 122 }, munsell: '2.5YR7/6', difficulty: '□' },
          { id: '12-50l', name: 'バーントオレンジ', code: '12-50L', hex: '#AA6347', rgb: { r: 170, g: 99, b: 71 }, munsell: '2.5YR5/6' },
          { id: '15-80l', name: 'タンジェリン', code: '15-80L', hex: '#F9B189', rgb: { r: 249, g: 177, b: 137 }, munsell: '5YR8/6', difficulty: '◆' },
          { id: '15-70h', name: 'カロットオレンジ', code: '15-70H', hex: '#D1A389', rgb: { r: 209, g: 163, b: 137 }, munsell: '5YR7/4' },
          { id: '15-60f', name: 'シナモン', code: '15-60F', hex: '#AD8975', rgb: { r: 173, g: 137, b: 117 }, munsell: '5YR6/3' },
          { id: '15-80f', name: 'コーラル', code: '15-80F', hex: '#E3BFAA', rgb: { r: 227, g: 191, b: 170 }, munsell: '5YR8/3' },
          { id: '17-70f', name: 'テラコッタ', code: '17-70F', hex: '#CAA68B', rgb: { r: 202, g: 166, b: 139 }, munsell: '7.5YR7/3' },
          { id: '17-70h', name: 'クレイ', code: '17-70H', hex: '#CFA484', rgb: { r: 207, g: 164, b: 132 }, munsell: '7.5YR7/4' },
          { id: '17-80f', name: 'ライトテラコッタ', code: '17-80F', hex: '#E6C4A9', rgb: { r: 230, g: 196, b: 169 }, munsell: '7.5YR8/3' },
          { id: '17-80h', name: 'バフ', code: '17-80H', hex: '#EABF9C', rgb: { r: 234, g: 191, b: 156 }, munsell: '7.5YR8/4' }
        ]
      },
      {
        id: 'deep-oranges',
        name: 'ディープオレンジ系',
        colors: [
          { id: '15-40h', name: 'ラストオレンジ', code: '15-40H', hex: '#7E513A', rgb: { r: 126, g: 81, b: 58 }, munsell: '5YR4/4', difficulty: '□' },
          { id: '15-40p', name: 'バーントシエナ', code: '15-40P', hex: '#944C14', rgb: { r: 148, g: 76, b: 20 }, munsell: '5YR4/8', difficulty: '◆' },
          { id: '17-40h', name: 'カッパー', code: '17-40H', hex: '#7E513A', rgb: { r: 126, g: 81, b: 58 }, munsell: '7.5YR4/4', difficulty: '□' },
          { id: '17-50l', name: 'アンバー', code: '17-50L', hex: '#A4693B', rgb: { r: 164, g: 105, b: 59 }, munsell: '7.5YR5/6', difficulty: '□' },
          { id: '17-70l', name: 'オークル', code: '17-70L', hex: '#DE9D6F', rgb: { r: 222, g: 157, b: 111 }, munsell: '7.5YR7/6' },
          { id: '17-70p', name: 'キャンディオレンジ', code: '17-70P', hex: '#E99955', rgb: { r: 233, g: 153, b: 85 }, munsell: '7.5YR7/8', difficulty: '◆' },
          { id: '17-50p', name: 'ブロンズ', code: '17-50P', hex: '#AE6523', rgb: { r: 174, g: 101, b: 35 }, munsell: '7.5YR5/8', difficulty: '□' },
          { id: '19-50h', name: 'ラテ', code: '19-50H', hex: '#966F4B', rgb: { r: 150, g: 111, b: 75 }, munsell: '10YR5/4' },
          { id: '19-40h', name: 'チェストナット', code: '19-40H', hex: '#7B532B', rgb: { r: 123, g: 83, b: 43 }, munsell: '10YR4/4', difficulty: '□' },
          { id: '19-40l', name: 'ロイヤルアンバー', code: '19-40L', hex: '#87551D', rgb: { r: 135, g: 85, b: 29 }, munsell: '10YR4/6', difficulty: '□' }
        ]
      }
    ]
  },
  {
    id: 'yellow',
    name: 'イエロー',
    description: '黄系統の色',
    hex: '#FFA000',
    subcategories: [
      {
        id: 'light-yellows',
        name: 'ライトイエロー系',
        colors: [
          { id: '19-90a', name: 'クリーム', code: '19-90A', hex: '#ECE7DE', rgb: { r: 236, g: 231, b: 222 }, munsell: '10YR9/0.5' },
          { id: '19-85a', name: 'バニラ', code: '19-85A', hex: '#DDD5CB', rgb: { r: 221, g: 213, b: 203 }, munsell: '10YR8.5/0.5' },
          { id: '19-92b', name: 'エッグシェル', code: '19-92B', hex: '#F2E8D9', rgb: { r: 242, g: 232, b: 217 }, munsell: '10YR9.2/1' },
          { id: '19-90b', name: 'アイボリーイエロー', code: '19-90B', hex: '#EDE2D4', rgb: { r: 237, g: 226, b: 212 }, munsell: '10YR9/1' },
          { id: '19-90f', name: 'ペールイエロー', code: '19-90F', hex: '#FFDFBB', rgb: { r: 255, g: 223, b: 187 }, munsell: '10YR9/3' },
          { id: '19-85f', name: 'ライトバター', code: '19-85F', hex: '#F3D2AD', rgb: { r: 243, g: 210, b: 173 }, munsell: '10YR8.5/3' },
          { id: '19-85l', name: 'ライトゴールド', code: '19-85L', hex: '#FFC889', rgb: { r: 255, g: 200, b: 137 }, munsell: '10YR8.5/6' },
          { id: '19-80l', name: 'ゴールデンイエロー', code: '19-80L', hex: '#F4BB81', rgb: { r: 244, g: 187, b: 129 }, munsell: '10YR8/6', difficulty: '□' },
          { id: '21-90b', name: 'ライトベージュ', code: '21-90B', hex: '#EFE3D3', rgb: { r: 239, g: 227, b: 211 }, munsell: '1.25Y9/1' },
          { id: '22-90a', name: 'フローラル', code: '22-90A', hex: '#EAE6DC', rgb: { r: 234, g: 230, b: 220 }, munsell: '2.5Y9/0.5' }
        ]
      },
      {
        id: 'medium-yellows',
        name: 'ミディアムイエロー系',
        colors: [
          { id: '19-75l', name: 'ハニー', code: '19-75L', hex: '#E3AD7A', rgb: { r: 227, g: 173, b: 122 }, munsell: '10YR7.5/6' },
          { id: '19-70l', name: 'アプリコット', code: '19-70L', hex: '#DAA165', rgb: { r: 218, g: 161, b: 101 }, munsell: '10YR7/6' },
          { id: '19-70h', name: 'マスタード', code: '19-70H', hex: '#CDA37C', rgb: { r: 205, g: 163, b: 124 }, munsell: '10YR7/4' },
          { id: '21-70f', name: 'オリーブベージュ', code: '21-70F', hex: '#C3A585', rgb: { r: 195, g: 165, b: 133 }, munsell: '1.25Y7/3' },
          { id: '21-70h', name: 'タン', code: '21-70H', hex: '#CDA77C', rgb: { r: 205, g: 167, b: 124 }, munsell: '1.25Y7/4' },
          { id: '22-80h', name: 'サフラン', code: '22-80H', hex: '#E4C395', rgb: { r: 228, g: 195, b: 149 }, munsell: '2.5Y8/4', difficulty: '□' },
          { id: '22-70l', name: 'ゴールデンロッド', code: '22-70L', hex: '#D5A561', rgb: { r: 213, g: 165, b: 97 }, munsell: '2.5Y7/6' },
          { id: '22-80l', name: 'レモンイエロー', code: '22-80L', hex: '#EEBE79', rgb: { r: 238, g: 190, b: 121 }, munsell: '2.5Y8/6', difficulty: '□' },
          { id: '25-85f', name: 'カナリアイエロー', code: '25-85F', hex: '#E8D4A8', rgb: { r: 232, g: 212, b: 168 }, munsell: '5Y8.5/3' },
          { id: '25-80h', name: 'ライムイエロー', code: '25-80H', hex: '#DEC590', rgb: { r: 222, g: 197, b: 144 }, munsell: '5Y8/4' }
        ]
      },
      {
        id: 'deep-yellows',
        name: 'ディープイエロー系',
        colors: [
          { id: '19-60h', name: 'オーカー', code: '19-60H', hex: '#B38D6A', rgb: { r: 179, g: 141, b: 106 }, munsell: '10YR6/4' },
          { id: '21-60h', name: 'ウォールナット', code: '21-60H', hex: '#B08B62', rgb: { r: 176, g: 139, b: 98 }, munsell: '1.25Y6/4' },
          { id: '21-40h', name: 'シェリー', code: '21-40H', hex: '#765227', rgb: { r: 118, g: 82, b: 39 }, munsell: '1.25Y4/4' },
          { id: '22-70h', name: 'ブラス', code: '22-70H', hex: '#CAA779', rgb: { r: 202, g: 167, b: 121 }, munsell: '2.5Y7/4' },
          { id: '22-50p', name: 'ディープゴールド', code: '22-50P', hex: '#A26D13', rgb: { r: 162, g: 109, b: 19 }, munsell: '2.5Y5/8', difficulty: '□' },
          { id: '25-70l', name: 'オリーブゴールド', code: '25-70L', hex: '#C9A659', rgb: { r: 201, g: 166, b: 89 }, munsell: '5Y7/6' },
          { id: '25-80p', name: 'レモングリーン', code: '25-80P', hex: '#E9BE59', rgb: { r: 233, g: 190, b: 89 }, munsell: '5Y8/8', difficulty: '◆' },
          { id: '25-60p', name: 'オリーブドラブ', code: '25-60P', hex: '#B1861E', rgb: { r: 177, g: 134, b: 30 }, munsell: '5Y6/8', difficulty: '□' },
          { id: '25-40h', name: 'ダークオリーブ', code: '25-40H', hex: '#6D5527', rgb: { r: 109, g: 85, b: 39 }, munsell: '5Y4/4' },
          { id: '27-85h', name: 'シトロン', code: '27-85H', hex: '#E9D698', rgb: { r: 233, g: 214, b: 152 }, munsell: '7.5Y8.5/4' }
        ]
      },
      {
        id: 'bright-yellows',
        name: 'ブライトイエロー系',
        colors: [
          { id: '27-90f', name: 'パステルイエロー', code: '27-90F', hex: '#F4E6B2', rgb: { r: 244, g: 230, b: 178 }, munsell: '7.5Y9/3' },
          { id: '27-50h', name: 'ブロンズイエロー', code: '27-50H', hex: '#887540', rgb: { r: 136, g: 117, b: 64 }, munsell: '7.5Y5/4' },
          { id: '29-90h', name: 'ライトイエロー', code: '29-90H', hex: '#F0E1A5', rgb: { r: 240, g: 225, b: 165 }, munsell: '10Y9/4' },
          { id: '29-85p', name: 'イエローグリーン', code: '29-85P', hex: '#E4D25B', rgb: { r: 228, g: 210, b: 91 }, munsell: '10Y8.5/8', difficulty: '◆' },
          { id: '29-80h', name: 'ライムグリーン', code: '29-80H', hex: '#D5C78C', rgb: { r: 213, g: 199, b: 140 }, munsell: '10Y8/4' },
          { id: '29-60h', name: 'オリーブ', code: '29-60H', hex: '#9D9259', rgb: { r: 157, g: 146, b: 89 }, munsell: '10Y6/4' },
          { id: '29-40h', name: 'カーキ', code: '29-40H', hex: '#675D2E', rgb: { r: 103, g: 93, b: 46 }, munsell: '10Y4/4', difficulty: '□' },
          { id: '32-50l', name: 'チャートリューズ', code: '32-50L', hex: '#7B792F', rgb: { r: 123, g: 121, b: 47 }, munsell: '2.5GY5/6', difficulty: '□' }
        ]
      }
    ]
  },
  {
    id: 'green',
    name: 'グリーン',
    description: '緑系統の色',
    hex: '#42A22D',
    subcategories: [
      {
        id: 'light-greens',
        name: 'ライトグリーン系',
        colors: [
          { id: '32-90d', name: 'ライトグリーン', code: '32-90D', hex: '#DCDDBB', rgb: { r: 220, g: 221, b: 187 }, munsell: '2.5GY9/2' },
          { id: '32-80d', name: 'セージグリーン', code: '32-80D', hex: '#CBC9A8', rgb: { r: 203, g: 201, b: 168 }, munsell: '2.5GY8/2' },
          { id: '35-90a', name: 'ライトミント', code: '35-90A', hex: '#E6E8DA', rgb: { r: 230, g: 232, b: 218 }, munsell: '5GY9/0.5' },
          { id: '35-85a', name: 'ミントクリーム', code: '35-85A', hex: '#D5D6CB', rgb: { r: 213, g: 214, b: 203 }, munsell: '5GY8.5/0.5' },
          { id: '35-80a', name: 'ソフトグリーン', code: '35-80A', hex: '#C9CCC0', rgb: { r: 201, g: 204, b: 192 }, munsell: '5GY8/0.5' },
          { id: '35-92b', name: 'パールグリーン', code: '35-92B', hex: '#E4E7D4', rgb: { r: 228, g: 231, b: 212 }, munsell: '5GY9.2/1' },
          { id: '35-90b', name: 'アイビーグリーン', code: '35-90B', hex: '#DFE3CE', rgb: { r: 223, g: 227, b: 206 }, munsell: '5GY9/1' },
          { id: '35-90d', name: 'ペールグリーン', code: '35-90D', hex: '#E4E5C1', rgb: { r: 228, g: 229, b: 193 }, munsell: '5GY9/2' },
          { id: '37-90d', name: 'ピスタチオ', code: '37-90D', hex: '#DAE8CA', rgb: { r: 218, g: 232, b: 202 }, munsell: '7.5GY9/2' },
          { id: '37-80l', name: 'ライムイエロー', code: '37-80L', hex: '#AFD181', rgb: { r: 175, g: 209, b: 129 }, munsell: '7.5GY8/6', difficulty: '◆' }
        ]
      },
      {
        id: 'medium-greens',
        name: 'ミディアムグリーン系',
        colors: [
          { id: '35-80h', name: 'セラドン', code: '35-80H', hex: '#C6CE93', rgb: { r: 198, g: 206, b: 147 }, munsell: '5GY8/4' },
          { id: '35-70h', name: 'オリーブグリーン', code: '35-70H', hex: '#A8AD7C', rgb: { r: 168, g: 173, b: 124 }, munsell: '5GY7/4' },
          { id: '35-80t', name: 'アップルグリーン', code: '35-80T', hex: '#C0D449', rgb: { r: 192, g: 212, b: 73 }, munsell: '5GY8/10', difficulty: '◆' },
          { id: '37-60t', name: 'パロットグリーン', code: '37-60T', hex: '#749729', rgb: { r: 116, g: 151, b: 41 }, munsell: '7.5GY6/10', difficulty: '◆' },
          { id: '37-50h', name: 'フォレストグリーン', code: '37-50H', hex: '#6D7E55', rgb: { r: 109, g: 126, b: 85 }, munsell: '7.5GY5/4' },
          { id: '37-50l', name: 'ハンターグリーン', code: '37-50L', hex: '#647D43', rgb: { r: 100, g: 125, b: 67 }, munsell: '7.5GY5/6' },
          { id: '39-80h', name: 'スプリンググリーン', code: '39-80H', hex: '#ACCEA1', rgb: { r: 172, g: 206, b: 161 }, munsell: '10GY8/4' },
          { id: '39-70h', name: 'フェルングリーン', code: '39-70H', hex: '#96B68C', rgb: { r: 150, g: 182, b: 140 }, munsell: '10GY7/4' },
          { id: '39-60l', name: 'エメラルドグリーン', code: '39-60L', hex: '#729B65', rgb: { r: 114, g: 155, b: 101 }, munsell: '10GY6/6' },
          { id: '39-50h', name: 'ジェイドグリーン', code: '39-50H', hex: '#527F5A', rgb: { r: 82, g: 127, b: 90 }, munsell: '10GY5/4' }
        ]
      },
      {
        id: 'deep-greens',
        name: 'ディープグリーン系',
        colors: [
          { id: '35-50h', name: 'ボトルグリーン', code: '35-50H', hex: '#757C4F', rgb: { r: 117, g: 124, b: 79 }, munsell: '5GY5/4' },
          { id: '35-40d', name: 'ダークオリーブ', code: '35-40D', hex: '#5A5D47', rgb: { r: 90, g: 93, b: 71 }, munsell: '5GY4/2', difficulty: '□' },
          { id: '35-30d', name: 'オリーブドラブ', code: '35-30D', hex: '#40432F', rgb: { r: 64, g: 67, b: 47 }, munsell: '5GY3/2', difficulty: '□' },
          { id: '39-40l', name: 'ディープグリーン', code: '39-40L', hex: '#3C632E', rgb: { r: 60, g: 99, b: 46 }, munsell: '10GY4/6', difficulty: '□' },
          { id: '39-40p', name: 'ケリーグリーン', code: '39-40P', hex: '#36671A', rgb: { r: 54, g: 103, b: 26 }, munsell: '10GY4/8', difficulty: '□' },
          { id: '42-50l', name: 'ヴィリディアン', code: '42-50L', hex: '#4B845C', rgb: { r: 75, g: 132, b: 92 }, munsell: '2.5G5/6' },
          { id: '42-40p', name: 'マラカイト', code: '42-40P', hex: '#006832', rgb: { r: 0, g: 104, b: 50 }, munsell: '2.5G4/8', difficulty: '□' },
          { id: '42-30h', name: 'ダークグリーン', code: '42-30H', hex: '#29442C', rgb: { r: 41, g: 68, b: 44 }, munsell: '2.5G3/4', difficulty: '□' },
          { id: '45-30d', name: 'パインニードル', code: '45-30D', hex: '#36473B', rgb: { r: 54, g: 71, b: 59 }, munsell: '5G3/2', difficulty: '□' },
          { id: '45-20d', name: 'エバーグリーン', code: '45-20D', hex: '#202E22', rgb: { r: 32, g: 46, b: 34 }, munsell: '5G2/2', difficulty: '◆' }
        ]
      },
      {
        id: 'teal-greens',
        name: 'ティール系',
        colors: [
          { id: '45-90a', name: 'ライトティール', code: '45-90A', hex: '#DDE6DC', rgb: { r: 221, g: 230, b: 220 }, munsell: '5G9/0.5' },
          { id: '45-85a', name: 'ミントグリーン', code: '45-85A', hex: '#CFD8D1', rgb: { r: 207, g: 216, b: 209 }, munsell: '5G8.5/0.5' },
          { id: '45-80a', name: 'シーグリーン', code: '45-80A', hex: '#C1CAC3', rgb: { r: 193, g: 202, b: 195 }, munsell: '5G8/0.5' },
          { id: '45-90d', name: 'ペールティール', code: '45-90D', hex: '#CBECD5', rgb: { r: 203, g: 236, b: 213 }, munsell: '5G9/2' },
          { id: '45-80h', name: 'ターコイズ', code: '45-80H', hex: '#9BD2B1', rgb: { r: 155, g: 210, b: 177 }, munsell: '5G8/4' },
          { id: '45-70h', name: 'アクアマリン', code: '45-70H', hex: '#82B799', rgb: { r: 130, g: 183, b: 153 }, munsell: '5G7/4' },
          { id: '45-70p', name: 'ジェイドターコイズ', code: '45-70P', hex: '#53BE8D', rgb: { r: 83, g: 190, b: 141 }, munsell: '5G7/8', difficulty: '◆' },
          { id: '45-60h', name: 'ヴェルディグリ', code: '45-60H', hex: '#6A9A7F', rgb: { r: 106, g: 154, b: 127 }, munsell: '5G6/4' },
          { id: '45-60l', name: 'エメラルド', code: '45-60L', hex: '#59A37B', rgb: { r: 89, g: 163, b: 123 }, munsell: '5G6/6' },
          { id: '45-50h', name: 'テールグリーン', code: '45-50H', hex: '#507D65', rgb: { r: 80, g: 125, b: 101 }, munsell: '5G5/4' }
        ]
      }
    ]
  },
  {
    id: 'blue-green',
    name: 'ブルーグリーン',
    description: '青緑系統の色',
    hex: '#00B5A5',
    subcategories: [
      {
        id: 'light-blue-greens',
        name: 'ライトブルーグリーン系',
        colors: [
          { id: '52-90a', name: 'ライトアクア', code: '52-90A', hex: '#D4E8E2', rgb: { r: 212, g: 232, b: 226 }, munsell: '2.5BG9/0.5' },
          { id: '52-85a', name: 'アクアミスト', code: '52-85A', hex: '#C5D6D0', rgb: { r: 197, g: 214, b: 208 }, munsell: '2.5BG8.5/0.5' },
          { id: '52-80a', name: 'ペールアクア', code: '52-80A', hex: '#B7C8C2', rgb: { r: 183, g: 200, b: 194 }, munsell: '2.5BG8/0.5' },
          { id: '52-90d', name: 'ウォーターブルー', code: '52-90D', hex: '#BEE9DD', rgb: { r: 190, g: 233, b: 221 }, munsell: '2.5BG9/2' },
          { id: '52-80h', name: 'アクアマリン', code: '52-80H', hex: '#8DD0C4', rgb: { r: 141, g: 208, b: 196 }, munsell: '2.5BG8/4' },
          { id: '52-80l', name: 'ターコイズブルー', code: '52-80L', hex: '#72CFC0', rgb: { r: 114, g: 207, b: 192 }, munsell: '2.5BG8/6', difficulty: '◆' },
          { id: '55-90a', name: 'ライトシーン', code: '55-90A', hex: '#D6E3DC', rgb: { r: 214, g: 227, b: 220 }, munsell: '5BG9/0.5' },
          { id: '55-85a', name: 'ミントブルー', code: '55-85A', hex: '#C5D3CC', rgb: { r: 197, g: 211, b: 204 }, munsell: '5BG8.5/0.5' },
          { id: '55-90d', name: 'パウダーブルー', code: '55-90D', hex: '#C5E4D6', rgb: { r: 197, g: 228, b: 214 }, munsell: '5BG9/2' },
          { id: '55-80h', name: 'セラドンブルー', code: '55-80H', hex: '#95CAB6', rgb: { r: 149, g: 202, b: 182 }, munsell: '5BG8/4' }
        ]
      },
      {
        id: 'medium-blue-greens',
        name: 'ミディアムブルーグリーン系',
        colors: [
          { id: '52-70h', name: 'ヴェルディグリス', code: '52-70H', hex: '#77B4AA', rgb: { r: 119, g: 180, b: 170 }, munsell: '2.5BG7/4' },
          { id: '52-70l', name: 'エメラルドグリーン', code: '52-70L', hex: '#5CB7A8', rgb: { r: 92, g: 183, b: 168 }, munsell: '2.5BG7/6' },
          { id: '52-60h', name: 'ペトロールブルー', code: '52-60H', hex: '#669799', rgb: { r: 102, g: 151, b: 153 }, munsell: '2.5BG6/4' },
          { id: '52-60l', name: 'ビリヤードグリーン', code: '52-60L', hex: '#4D9A90', rgb: { r: 77, g: 154, b: 144 }, munsell: '2.5BG6/6' },
          { id: '55-70h', name: 'オーシャンブルー', code: '55-70H', hex: '#79B0A0', rgb: { r: 121, g: 176, b: 160 }, munsell: '5BG7/4' },
          { id: '55-70l', name: 'ジェイドグリーン', code: '55-70L', hex: '#60B294', rgb: { r: 96, g: 178, b: 148 }, munsell: '5BG7/6' },
          { id: '55-60h', name: 'ティールブルー', code: '55-60H', hex: '#679489', rgb: { r: 103, g: 148, b: 137 }, munsell: '5BG6/4' },
          { id: '55-60l', name: 'マラカイトグリーン', code: '55-60L', hex: '#4F967C', rgb: { r: 79, g: 150, b: 124 }, munsell: '5BG6/6', difficulty: '□' },
          { id: '57-80h', name: 'ライトティール', code: '57-80H', hex: '#9FBF9B', rgb: { r: 159, g: 191, b: 155 }, munsell: '7.5BG8/4' },
          { id: '57-70h', name: 'フォレストブルー', code: '57-70H', hex: '#7BA591', rgb: { r: 123, g: 165, b: 145 }, munsell: '7.5BG7/4' }
        ]
      },
      {
        id: 'deep-blue-greens',
        name: 'ディープブルーグリーン系',
        colors: [
          { id: '52-50h', name: 'ディープアクア', code: '52-50H', hex: '#577A77', rgb: { r: 87, g: 122, b: 119 }, munsell: '2.5BG5/4' },
          { id: '52-50l', name: 'パインニードル', code: '52-50L', hex: '#467C6F', rgb: { r: 70, g: 124, b: 111 }, munsell: '2.5BG5/6', difficulty: '□' },
          { id: '52-40h', name: 'ハンターグリーン', code: '52-40H', hex: '#3F5D5B', rgb: { r: 63, g: 93, b: 91 }, munsell: '2.5BG4/4', difficulty: '□' },
          { id: '52-40l', name: 'ジャングルグリーン', code: '52-40L', hex: '#2F5F57', rgb: { r: 47, g: 95, b: 87 }, munsell: '2.5BG4/6', difficulty: '□' },
          { id: '55-50h', name: 'ディープティール', code: '55-50H', hex: '#587669', rgb: { r: 88, g: 118, b: 105 }, munsell: '5BG5/4', difficulty: '□' },
          { id: '55-50l', name: 'スプルースグリーン', code: '55-50L', hex: '#46785F', rgb: { r: 70, g: 120, b: 95 }, munsell: '5BG5/6', difficulty: '□' },
          { id: '55-40h', name: 'ダークエメラルド', code: '55-40H', hex: '#3F5955', rgb: { r: 63, g: 89, b: 85 }, munsell: '5BG4/4', difficulty: '□' },
          { id: '55-30d', name: 'ディープフォレスト', code: '55-30D', hex: '#2B3E39', rgb: { r: 43, g: 62, b: 57 }, munsell: '5BG3/2', difficulty: '◆' },
          { id: '57-60h', name: 'ボトルグリーン', code: '57-60H', hex: '#69845B', rgb: { r: 105, g: 132, b: 91 }, munsell: '7.5BG6/4' },
          { id: '57-50h', name: 'セージグリーン', code: '57-50H', hex: '#5B6B4A', rgb: { r: 91, g: 107, b: 74 }, munsell: '7.5BG5/4' }
        ]
      },
      {
        id: 'cyan-blues',
        name: 'シアンブルー系',
        colors: [
          { id: '59-90d', name: 'ライトシアン', code: '59-90D', hex: '#BDE5D5', rgb: { r: 189, g: 229, b: 213 }, munsell: '10BG9/2' },
          { id: '59-80h', name: 'ペールシアン', code: '59-80H', hex: '#89C7B3', rgb: { r: 137, g: 199, b: 179 }, munsell: '10BG8/4' },
          { id: '59-80l', name: 'ターコイズ', code: '59-80L', hex: '#6EC9B0', rgb: { r: 110, g: 201, b: 176 }, munsell: '10BG8/6', difficulty: '◆' },
          { id: '59-70h', name: 'シアンブルー', code: '59-70H', hex: '#7BAF9F', rgb: { r: 123, g: 175, b: 159 }, munsell: '10BG7/4' },
          { id: '59-70l', name: 'トリコロールグリーン', code: '59-70L', hex: '#60B192', rgb: { r: 96, g: 177, b: 146 }, munsell: '10BG7/6' },
          { id: '59-60h', name: 'オーシャングリーン', code: '59-60H', hex: '#6D9587', rgb: { r: 109, g: 149, b: 135 }, munsell: '10BG6/4' },
          { id: '59-60l', name: 'コバルトグリーン', code: '59-60L', hex: '#54967A', rgb: { r: 84, g: 150, b: 122 }, munsell: '10BG6/6', difficulty: '□' },
          { id: '59-50h', name: 'ディープシアン', code: '59-50H', hex: '#5B7A6E', rgb: { r: 91, g: 122, b: 110 }, munsell: '10BG5/4', difficulty: '□' },
          { id: '59-40h', name: 'ダークティール', code: '59-40H', hex: '#465C57', rgb: { r: 70, g: 92, b: 87 }, munsell: '10BG4/4', difficulty: '□' },
          { id: '59-30d', name: 'ディープオーシャン', code: '59-30D', hex: '#2E3F3B', rgb: { r: 46, g: 63, b: 59 }, munsell: '10BG3/2', difficulty: '◆' }
        ]
      }
    ]
  },
  {
    id: 'blue',
    name: 'ブルー',
    description: '青系統の色',
    hex: '#0066CC',
    subcategories: [
      {
        id: 'light-blues',
        name: 'ライトブルー系',
        colors: [
          { id: '62-90a', name: 'ライトブルー', code: '62-90A', hex: '#D1E5E1', rgb: { r: 209, g: 229, b: 225 }, munsell: '2.5B9/0.5' },
          { id: '62-85a', name: 'ペールブルー', code: '62-85A', hex: '#C0D2CF', rgb: { r: 192, g: 210, b: 207 }, munsell: '2.5B8.5/0.5' },
          { id: '62-80a', name: 'ライトスカイ', code: '62-80A', hex: '#B2C3C1', rgb: { r: 178, g: 195, b: 193 }, munsell: '2.5B8/0.5' },
          { id: '62-90d', name: 'エアブルー', code: '62-90D', hex: '#B8E1DC', rgb: { r: 184, g: 225, b: 220 }, munsell: '2.5B9/2' },
          { id: '62-80h', name: 'アクアブルー', code: '62-80H', hex: '#81C5C1', rgb: { r: 129, g: 197, b: 193 }, munsell: '2.5B8/4' },
          { id: '62-80l', name: 'ターコイズブルー', code: '62-80L', hex: '#63C3BE', rgb: { r: 99, g: 195, b: 190 }, munsell: '2.5B8/6', difficulty: '◆' },
          { id: '65-90a', name: 'アイスブルー', code: '65-90A', hex: '#D3E0DC', rgb: { r: 211, g: 224, b: 220 }, munsell: '5B9/0.5' },
          { id: '65-85a', name: 'フロストブルー', code: '65-85A', hex: '#BFD0CC', rgb: { r: 191, g: 208, b: 204 }, munsell: '5B8.5/0.5' },
          { id: '65-90d', name: 'ベビーブルー', code: '65-90D', hex: '#BADFDB', rgb: { r: 186, g: 223, b: 219 }, munsell: '5B9/2' },
          { id: '65-80h', name: 'パウダーブルー', code: '65-80H', hex: '#84BFB9', rgb: { r: 132, g: 191, b: 185 }, munsell: '5B8/4' }
        ]
      },
      {
        id: 'medium-blues',
        name: 'ミディアムブルー系',
        colors: [
          { id: '62-70h', name: 'オーシャンブルー', code: '62-70H', hex: '#70A9A6', rgb: { r: 112, g: 169, b: 166 }, munsell: '2.5B7/4' },
          { id: '62-70l', name: 'ティールブルー', code: '62-70L', hex: '#52AAA5', rgb: { r: 82, g: 170, b: 165 }, munsell: '2.5B7/6' },
          { id: '62-60h', name: 'スチールブルー', code: '62-60H', hex: '#5E8D8A', rgb: { r: 94, g: 141, b: 138 }, munsell: '2.5B6/4' },
          { id: '62-60l', name: 'シーグリーン', code: '62-60L', hex: '#428E88', rgb: { r: 66, g: 142, b: 136 }, munsell: '2.5B6/6', difficulty: '□' },
          { id: '65-70h', name: 'エーゲ海ブルー', code: '65-70H', hex: '#73A6A0', rgb: { r: 115, g: 166, b: 160 }, munsell: '5B7/4' },
          { id: '65-70l', name: 'ピーコックブルー', code: '65-70L', hex: '#55A79F', rgb: { r: 85, g: 167, b: 159 }, munsell: '5B7/6' },
          { id: '65-60h', name: 'スレートブルー', code: '65-60H', hex: '#618A85', rgb: { r: 97, g: 138, b: 133 }, munsell: '5B6/4' },
          { id: '65-60l', name: 'ジャデブルー', code: '65-60L', hex: '#458B82', rgb: { r: 69, g: 139, b: 130 }, munsell: '5B6/6', difficulty: '□' },
          { id: '67-80h', name: 'スカイブルー', code: '67-80H', hex: '#9AB6A8', rgb: { r: 154, g: 182, b: 168 }, munsell: '7.5B8/4' },
          { id: '67-70h', name: 'ライトスチール', code: '67-70H', hex: '#7C9D92', rgb: { r: 124, g: 157, b: 146 }, munsell: '7.5B7/4' }
        ]
      },
      {
        id: 'deep-blues',
        name: 'ディープブルー系',
        colors: [
          { id: '62-50h', name: 'ディープティール', code: '62-50H', hex: '#4F706E', rgb: { r: 79, g: 112, b: 110 }, munsell: '2.5B5/4', difficulty: '□' },
          { id: '62-50l', name: 'ダークアクア', code: '62-50L', hex: '#327169', rgb: { r: 50, g: 113, b: 105 }, munsell: '2.5B5/6', difficulty: '□' },
          { id: '62-40h', name: 'ダークスチール', code: '62-40H', hex: '#3A5355', rgb: { r: 58, g: 83, b: 85 }, munsell: '2.5B4/4', difficulty: '□' },
          { id: '65-50h', name: 'ネイビーティール', code: '65-50H', hex: '#526D68', rgb: { r: 82, g: 109, b: 104 }, munsell: '5B5/4', difficulty: '□' },
          { id: '65-50l', name: 'ハンターブルー', code: '65-50L', hex: '#366E64', rgb: { r: 54, g: 110, b: 100 }, munsell: '5B5/6', difficulty: '□' },
          { id: '65-40h', name: 'ダークブルーグレー', code: '65-40H', hex: '#3B5053', rgb: { r: 59, g: 80, b: 83 }, munsell: '5B4/4', difficulty: '□' },
          { id: '67-60h', name: 'フォレストブルー', code: '67-60H', hex: '#657B73', rgb: { r: 101, g: 123, b: 115 }, munsell: '7.5B6/4' },
          { id: '67-50h', name: 'セージブルー', code: '67-50H', hex: '#54625B', rgb: { r: 84, g: 98, b: 91 }, munsell: '7.5B5/4', difficulty: '□' },
          { id: '69-70h', name: 'グリーンブルー', code: '69-70H', hex: '#7B9B88', rgb: { r: 123, g: 155, b: 136 }, munsell: '10B7/4' },
          { id: '69-60h', name: 'ダークエメラルド', code: '69-60H', hex: '#5F796A', rgb: { r: 95, g: 121, b: 106 }, munsell: '10B6/4' }
        ]
      },
      {
        id: 'pure-blues',
        name: 'ピュアブルー系',
        colors: [
          { id: '72-90d', name: 'ソフトブルー', code: '72-90D', hex: '#B4D1CD', rgb: { r: 180, g: 209, b: 205 }, munsell: '2.5PB9/2' },
          { id: '72-80h', name: 'ライトネイビー', code: '72-80H', hex: '#7FB0AD', rgb: { r: 127, g: 176, b: 173 }, munsell: '2.5PB8/4' },
          { id: '72-80l', name: 'オーシャンブルー', code: '72-80L', hex: '#5DB0AE', rgb: { r: 93, g: 176, b: 174 }, munsell: '2.5PB8/6', difficulty: '◆' },
          { id: '72-70h', name: 'ダックブルー', code: '72-70H', hex: '#6D9A97', rgb: { r: 109, g: 154, b: 151 }, munsell: '2.5PB7/4' },
          { id: '72-60h', name: 'ピーコックブルー', code: '72-60H', hex: '#587E7C', rgb: { r: 88, g: 126, b: 124 }, munsell: '2.5PB6/4', difficulty: '□' },
          { id: '72-50h', name: 'ディープオーシャン', code: '72-50H', hex: '#466360', rgb: { r: 70, g: 99, b: 96 }, munsell: '2.5PB5/4', difficulty: '□' },
          { id: '75-90a', name: 'クラウドブルー', code: '75-90A', hex: '#CFD9D5', rgb: { r: 207, g: 217, b: 213 }, munsell: '5PB9/0.5' },
          { id: '75-85a', name: 'シルバーブルー', code: '75-85A', hex: '#BCC7C3', rgb: { r: 188, g: 199, b: 195 }, munsell: '5PB8.5/0.5' },
          { id: '75-80h', name: 'グレーブルー', code: '75-80H', hex: '#7CA5A2', rgb: { r: 124, g: 165, b: 162 }, munsell: '5PB8/4' },
          { id: '75-70h', name: 'スモークブルー', code: '75-70H', hex: '#6A9590', rgb: { r: 106, g: 149, b: 144 }, munsell: '5PB7/4' }
        ]
      },
      {
        id: 'royal-blues',
        name: 'ロイヤルブルー系',
        colors: [
          { id: '76-80h', name: 'コーンフラワー', code: '76-80H', hex: '#87A19D', rgb: { r: 135, g: 161, b: 157 }, munsell: '7.5PB8/4' },
          { id: '76-70h', name: 'ウェッジウッド', code: '76-70H', hex: '#708D8A', rgb: { r: 112, g: 141, b: 138 }, munsell: '7.5PB7/4' },
          { id: '76-60h', name: 'スレートブルー', code: '76-60H', hex: '#57736F', rgb: { r: 87, g: 115, b: 111 }, munsell: '7.5PB6/4', difficulty: '□' },
          { id: '76-50h', name: 'ガンメタルブルー', code: '76-50H', hex: '#425951', rgb: { r: 66, g: 89, b: 81 }, munsell: '7.5PB5/4', difficulty: '□' },
          { id: '77-90d', name: 'パステルブルー', code: '77-90D', hex: '#B3CCC7', rgb: { r: 179, g: 204, b: 199 }, munsell: '10PB9/2' },
          { id: '77-80h', name: 'ペリウィンクル', code: '77-80H', hex: '#829D97', rgb: { r: 130, g: 157, b: 151 }, munsell: '10PB8/4' },
          { id: '77-70h', name: 'カデットブルー', code: '77-70H', hex: '#6C8983', rgb: { r: 108, g: 137, b: 131 }, munsell: '10PB7/4' },
          { id: '77-60h', name: 'ミッドナイトブルー', code: '77-60H', hex: '#546F6A', rgb: { r: 84, g: 111, b: 106 }, munsell: '10PB6/4', difficulty: '□' },
          { id: '77-50h', name: 'インディゴブルー', code: '77-50H', hex: '#3F554F', rgb: { r: 63, g: 85, b: 79 }, munsell: '10PB5/4', difficulty: '□' },
          { id: '77-40h', name: 'ダークネイビー', code: '77-40H', hex: '#2F3E3A', rgb: { r: 47, g: 62, b: 58 }, munsell: '10PB4/4', difficulty: '◆' }
        ]
      }
    ]
  },
  {
    id: 'purple',
    name: 'パープル',
    description: '紫系統の色',
    hex: '#7B3F99',
    subcategories: [
      {
        id: 'light-purples',
        name: 'ライトパープル系',
        colors: [
          { id: '82-90a', name: 'ライトパープル', code: '82-90A', hex: '#D5D9DA', rgb: { r: 213, g: 217, b: 218 }, munsell: '2.5P9/0.5' },
          { id: '82-85a', name: 'ライラックグレー', code: '82-85A', hex: '#C2C5C6', rgb: { r: 194, g: 197, b: 198 }, munsell: '2.5P8.5/0.5' },
          { id: '82-80a', name: 'パールパープル', code: '82-80A', hex: '#B4B6B7', rgb: { r: 180, g: 182, b: 183 }, munsell: '2.5P8/0.5' },
          { id: '82-90d', name: 'ソフトラベンダー', code: '82-90D', hex: '#B8BDD6', rgb: { r: 184, g: 189, b: 214 }, munsell: '2.5P9/2' },
          { id: '82-80h', name: 'ラベンダーグレー', code: '82-80H', hex: '#8894B1', rgb: { r: 136, g: 148, b: 177 }, munsell: '2.5P8/4' },
          { id: '82-80l', name: 'アメジストパープル', code: '82-80L', hex: '#7A8EAF', rgb: { r: 122, g: 142, b: 175 }, munsell: '2.5P8/6', difficulty: '◆' },
          { id: '85-90a', name: 'ペールパープル', code: '85-90A', hex: '#D7D7D9', rgb: { r: 215, g: 215, b: 217 }, munsell: '5P9/0.5' },
          { id: '85-85a', name: 'ミストパープル', code: '85-85A', hex: '#C5C3C5', rgb: { r: 197, g: 195, b: 197 }, munsell: '5P8.5/0.5' },
          { id: '85-90d', name: 'パウダーパープル', code: '85-90D', hex: '#BCBDD4', rgb: { r: 188, g: 189, b: 212 }, munsell: '5P9/2' },
          { id: '85-80h', name: 'ライラック', code: '85-80H', hex: '#8B90AB', rgb: { r: 139, g: 144, b: 171 }, munsell: '5P8/4' }
        ]
      },
      {
        id: 'medium-purples',
        name: 'ミディアムパープル系',
        colors: [
          { id: '82-70h', name: 'スレートパープル', code: '82-70H', hex: '#717A94', rgb: { r: 113, g: 122, b: 148 }, munsell: '2.5P7/4' },
          { id: '82-70l', name: 'パーウィンクル', code: '82-70L', hex: '#677A9A', rgb: { r: 103, g: 122, b: 154 }, munsell: '2.5P7/6' },
          { id: '82-60h', name: 'ダスティパープル', code: '82-60H', hex: '#5D6177', rgb: { r: 93, g: 97, b: 119 }, munsell: '2.5P6/4' },
          { id: '82-60l', name: 'ブルーベリー', code: '82-60L', hex: '#535F7D', rgb: { r: 83, g: 95, b: 125 }, munsell: '2.5P6/6', difficulty: '□' },
          { id: '85-70h', name: 'ヴァイオレットグレー', code: '85-70H', hex: '#747489', rgb: { r: 116, g: 116, b: 137 }, munsell: '5P7/4' },
          { id: '85-70l', name: 'アイリス', code: '85-70L', hex: '#6B738C', rgb: { r: 107, g: 115, b: 140 }, munsell: '5P7/6' },
          { id: '85-60h', name: 'グレープ', code: '85-60H', hex: '#5C5C70', rgb: { r: 92, g: 92, b: 112 }, munsell: '5P6/4' },
          { id: '85-60l', name: 'インディゴパープル', code: '85-60L', hex: '#515974', rgb: { r: 81, g: 89, b: 116 }, munsell: '5P6/6', difficulty: '□' },
          { id: '89-80h', name: 'モーブ', code: '89-80H', hex: '#9992A3', rgb: { r: 153, g: 146, b: 163 }, munsell: '10P8/4' },
          { id: '89-70h', name: 'ヘザー', code: '89-70H', hex: '#7F7B87', rgb: { r: 127, g: 123, b: 135 }, munsell: '10P7/4' }
        ]
      },
      {
        id: 'deep-purples',
        name: 'ディープパープル系',
        colors: [
          { id: '82-50h', name: 'ディープスレート', code: '82-50H', hex: '#474B5A', rgb: { r: 71, g: 75, b: 90 }, munsell: '2.5P5/4', difficulty: '□' },
          { id: '82-50l', name: 'ミッドナイトパープル', code: '82-50L', hex: '#3F455C', rgb: { r: 63, g: 69, b: 92 }, munsell: '2.5P5/6', difficulty: '□' },
          { id: '82-40h', name: 'ダークスレート', code: '82-40H', hex: '#343544', rgb: { r: 52, g: 53, b: 68 }, munsell: '2.5P4/4', difficulty: '□' },
          { id: '82-30d', name: 'チャコールパープル', code: '82-30D', hex: '#242432', rgb: { r: 36, g: 36, b: 50 }, munsell: '2.5P3/2', difficulty: '◆' },
          { id: '85-50h', name: 'プラムグレー', code: '85-50H', hex: '#484756', rgb: { r: 72, g: 71, b: 86 }, munsell: '5P5/4', difficulty: '□' },
          { id: '85-50l', name: 'エッグプラント', code: '85-50L', hex: '#414252', rgb: { r: 65, g: 66, b: 82 }, munsell: '5P5/6', difficulty: '□' },
          { id: '85-40h', name: 'ダークプラム', code: '85-40H', hex: '#35343E', rgb: { r: 53, g: 52, b: 62 }, munsell: '5P4/4', difficulty: '□' },
          { id: '85-30d', name: 'ディープオーバーギン', code: '85-30D', hex: '#252333', rgb: { r: 37, g: 35, b: 51 }, munsell: '5P3/2', difficulty: '◆' },
          { id: '89-60h', name: 'ウィスタリア', code: '89-60H', hex: '#5F5B66', rgb: { r: 95, g: 91, b: 102 }, munsell: '10P6/4' },
          { id: '89-50h', name: 'バイオレット', code: '89-50H', hex: '#4A454E', rgb: { r: 74, g: 69, b: 78 }, munsell: '10P5/4', difficulty: '□' },
          { id: '89-40h', name: 'ディープモーブ', code: '89-40H', hex: '#36323A', rgb: { r: 54, g: 50, b: 58 }, munsell: '10P4/4', difficulty: '□' },
          { id: '89-30d', name: 'ダークバイオレット', code: '89-30D', hex: '#262234', rgb: { r: 38, g: 34, b: 52 }, munsell: '10P3/2', difficulty: '◆' }
        ]
      }
    ]
  },
  {
    id: 'pink-red-purple',
    name: 'ピンク・レッドパープル',
    description: 'ピンク・赤紫系統の色',
    hex: '#D6336C',
    subcategories: [
      {
        id: 'light-pinks',
        name: 'ライトピンク系',
        colors: [
          { id: '95-90a', name: 'ペールピンク', code: '95-90A', hex: '#E0D7D9', rgb: { r: 224, g: 215, b: 217 }, munsell: '5RP9/0.5' },
          { id: '95-85a', name: 'ソフトピンク', code: '95-85A', hex: '#CFC2C5', rgb: { r: 207, g: 194, b: 197 }, munsell: '5RP8.5/0.5' },
          { id: '95-80a', name: 'ライトローズ', code: '95-80A', hex: '#BEB1B4', rgb: { r: 190, g: 177, b: 180 }, munsell: '5RP8/0.5' },
          { id: '95-90d', name: 'ベビーピンク', code: '95-90D', hex: '#CCBCD3', rgb: { r: 204, g: 188, b: 211 }, munsell: '5RP9/2' },
          { id: '95-80h', name: 'ローズクォーツ', code: '95-80H', hex: '#A791AC', rgb: { r: 167, g: 145, b: 172 }, munsell: '5RP8/4' },
          { id: '95-80l', name: 'マゼンタピンク', code: '95-80L', hex: '#A28AAE', rgb: { r: 162, g: 138, b: 174 }, munsell: '5RP8/6', difficulty: '◆' },
          { id: '99-90a', name: 'ブラッシュピンク', code: '99-90A', hex: '#E3D6D5', rgb: { r: 227, g: 214, b: 213 }, munsell: '10RP9/0.5' },
          { id: '99-85a', name: 'シェルピンク', code: '99-85A', hex: '#D2C2C1', rgb: { r: 210, g: 194, b: 193 }, munsell: '10RP8.5/0.5' },
          { id: '99-90d', name: 'オーキッドピンク', code: '99-90D', hex: '#D0BCC5', rgb: { r: 208, g: 188, b: 197 }, munsell: '10RP9/2' },
          { id: '99-80h', name: 'ダスティローズ', code: '99-80H', hex: '#AB9198', rgb: { r: 171, g: 145, b: 152 }, munsell: '10RP8/4' }
        ]
      },
      {
        id: 'medium-pinks',
        name: 'ミディアムピンク系',
        colors: [
          { id: '95-70h', name: 'ローズピンク', code: '95-70H', hex: '#8D7593', rgb: { r: 141, g: 117, b: 147 }, munsell: '5RP7/4' },
          { id: '95-70l', name: 'オーキッド', code: '95-70L', hex: '#846B94', rgb: { r: 132, g: 107, b: 148 }, munsell: '5RP7/6' },
          { id: '95-60h', name: 'プラムピンク', code: '95-60H', hex: '#6F5875', rgb: { r: 111, g: 88, b: 117 }, munsell: '5RP6/4' },
          { id: '95-60l', name: 'アメジスト', code: '95-60L', hex: '#654F77', rgb: { r: 101, g: 79, b: 119 }, munsell: '5RP6/6', difficulty: '□' },
          { id: '99-70h', name: 'モーブピンク', code: '99-70H', hex: '#917681', rgb: { r: 145, g: 118, b: 129 }, munsell: '10RP7/4' },
          { id: '99-70l', name: 'フクシアピンク', code: '99-70L', hex: '#896C7B', rgb: { r: 137, g: 108, b: 123 }, munsell: '10RP7/6' },
          { id: '99-60h', name: 'ダムソンピンク', code: '99-60H', hex: '#735A65', rgb: { r: 115, g: 90, b: 101 }, munsell: '10RP6/4' },
          { id: '99-60l', name: 'レッドバイオレット', code: '99-60L', hex: '#6B5064', rgb: { r: 107, g: 80, b: 100 }, munsell: '10RP6/6', difficulty: '□' },
          { id: '95-50h', name: 'グレープピンク', code: '95-50H', hex: '#553A57', rgb: { r: 85, g: 58, b: 87 }, munsell: '5RP5/4', difficulty: '□' },
          { id: '99-50h', name: 'ワインピンク', code: '99-50H', hex: '#594049', rgb: { r: 89, g: 64, b: 73 }, munsell: '10RP5/4', difficulty: '□' }
        ]
      },
      {
        id: 'deep-pinks',
        name: 'ディープピンク系',
        colors: [
          { id: '95-50l', name: 'ディープオーキッド', code: '95-50L', hex: '#4D3151', rgb: { r: 77, g: 49, b: 81 }, munsell: '5RP5/6', difficulty: '□' },
          { id: '95-40h', name: 'ダークプラム', code: '95-40H', hex: '#3A273D', rgb: { r: 58, g: 39, b: 61 }, munsell: '5RP4/4', difficulty: '□' },
          { id: '95-40l', name: 'ロイヤルパープル', code: '95-40L', hex: '#351F3A', rgb: { r: 53, g: 31, b: 58 }, munsell: '5RP4/6', difficulty: '□' },
          { id: '95-30d', name: 'ダークオーキッド', code: '95-30D', hex: '#261825', rgb: { r: 38, g: 24, b: 37 }, munsell: '5RP3/2', difficulty: '◆' },
          { id: '99-50l', name: 'クランベリー', code: '99-50L', hex: '#4B3340', rgb: { r: 75, g: 51, b: 64 }, munsell: '10RP5/6', difficulty: '□' },
          { id: '99-40h', name: 'バーガンディピンク', code: '99-40H', hex: '#382630', rgb: { r: 56, g: 38, b: 48 }, munsell: '10RP4/4', difficulty: '□' },
          { id: '99-40l', name: 'マルーンピンク', code: '99-40L', hex: '#331E2D', rgb: { r: 51, g: 30, b: 45 }, munsell: '10RP4/6', difficulty: '□' },
          { id: '99-30d', name: 'ダークマルーン', code: '99-30D', hex: '#241723', rgb: { r: 36, g: 23, b: 35 }, munsell: '10RP3/2', difficulty: '◆' }
        ]
      },
      {
        id: 'bright-magentas',
        name: 'ブライトマゼンタ系',
        colors: [
          { id: '95-70p', name: 'ビビッドピンク', code: '95-70P', hex: '#C257A3', rgb: { r: 194, g: 87, b: 163 }, munsell: '5RP7/8', difficulty: '◆' },
          { id: '95-60p', name: 'ホットピンク', code: '95-60P', hex: '#AB3D87', rgb: { r: 171, g: 61, b: 135 }, munsell: '5RP6/8', difficulty: '◆' },
          { id: '95-50p', name: 'マゼンタ', code: '95-50P', hex: '#942269', rgb: { r: 148, g: 34, b: 105 }, munsell: '5RP5/8', difficulty: '◆' },
          { id: '99-70p', name: 'ローズレッド', code: '99-70P', hex: '#C558A3', rgb: { r: 197, g: 88, b: 163 }, munsell: '10RP7/8', difficulty: '◆' },
          { id: '99-60p', name: 'フクシア', code: '99-60P', hex: '#AE3E87', rgb: { r: 174, g: 62, b: 135 }, munsell: '10RP6/8', difficulty: '◆' },
          { id: '99-50p', name: 'シクラメン', code: '99-50P', hex: '#97236A', rgb: { r: 151, g: 35, b: 106 }, munsell: '10RP5/8', difficulty: '◆' },
          { id: '99-40p', name: 'ディープマゼンタ', code: '99-40P', hex: '#7A0E4B', rgb: { r: 122, g: 14, b: 75 }, munsell: '10RP4/8', difficulty: '◆' }
        ]
      }
    ]
  }
]

// 用途に応じた推奨カテゴリを返す関数
// 現実的な塗装では、顧客の要望により全ての部位で全色が利用可能
export function getRecommendedColorsForUsage(usage: ColorUsage): ColorCategory[] {
  // 全ての用途で全色を利用可能とする
  // 顧客の好みやデザイン要求により、どの部位にも様々な色が使用される
  return colorHierarchy
}

// IDから色情報を取得する関数
export function getColorById(colorId: string): PaintColor | null {
  for (const category of colorHierarchy) {
    for (const subcategory of category.subcategories) {
      const color = subcategory.colors.find(c => c.id === colorId)
      if (color) return color
    }
  }
  return null
}

// 色IDから日塗工番号用のプロンプトテキストを生成
export function generateColorPrompt(colorId: string): string {
  const color = getColorById(colorId)
  if (!color) return ''

  const difficultyText = color.difficulty ? ` （${color.difficulty === '□' ? '水性塗料では出にくい色' : '塗料によっては出にくい色'}）` : ''

  return `壁の色は、・R.G.B: ${color.rgb.r}　${color.rgb.g}　${color.rgb.b} ・16進数カラーコード: ${color.hex}${color.munsell ? ` ・マンセル値: ${color.munsell}` : ''} ・日本塗料工業会色番号: ${color.code}${difficultyText}  の色に変更してください。`
}

// プロンプト生成用の色情報配列
export const colorPromptArray = colorHierarchy.flatMap(category =>
  category.subcategories.flatMap(subcategory =>
    subcategory.colors.map(color => ({
      id: color.id,
      name: color.name,
      code: color.code,
      hex: color.hex,
      rgb: color.rgb,
      munsell: color.munsell || 'N/A',
      difficulty: color.difficulty || 'N/A',
      categoryName: category.name,
      subcategoryName: subcategory.name
    }))
  )
)