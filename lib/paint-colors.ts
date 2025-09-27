export interface PaintColor {
  id: string
  name: string
  code: string // 日塗工番号
  hex: string
  rgb: { r: number; g: number; b: number }
  munsell?: string
}

export const wallColors: PaintColor[] = [
  { id: 'no-change', name: '変更なし', code: 'N/A', hex: 'transparent', rgb: { r: 0, g: 0, b: 0 } },
  { id: 'n90', name: 'ホワイト', code: 'N90', hex: '#E5E5E5', rgb: { r: 229, g: 229, b: 229 } },
  { id: 'n80', name: 'ライトグレー', code: 'N80', hex: '#CCCCCC', rgb: { r: 204, g: 204, b: 204 } },
  { id: 'n70', name: 'グレー', code: 'N70', hex: '#B3B3B3', rgb: { r: 179, g: 179, b: 179 } },
  { id: '07-40x', name: 'レッド', code: '07-40X', hex: '#B90019', rgb: { r: 185, g: 0, b: 25 }, munsell: '7.5R4/14' },
  { id: '15-50t', name: 'ベージュ', code: '15-50T', hex: '#D4A76A', rgb: { r: 212, g: 167, b: 106 }, munsell: '10YR7/6' },
  { id: '22-85b', name: 'ライトイエロー', code: '22-85B', hex: '#F5E6A3', rgb: { r: 245, g: 230, b: 163 }, munsell: '5Y9/4' },
  { id: '35-70p', name: 'グリーン', code: '35-70P', hex: '#5FA775', rgb: { r: 95, g: 167, b: 117 }, munsell: '10GY6/8' },
  { id: '45-40t', name: 'ブルー', code: '45-40T', hex: '#4A7C9E', rgb: { r: 74, g: 124, b: 158 }, munsell: '10B5/8' },
  { id: '55-30d', name: 'ネイビー', code: '55-30D', hex: '#2B4C6F', rgb: { r: 43, g: 76, b: 111 }, munsell: '5PB3/8' },
  { id: '62-60h', name: 'パープル', code: '62-60H', hex: '#8B5A8C', rgb: { r: 139, g: 90, b: 140 }, munsell: '5P5/8' },
  { id: '09-60l', name: 'ピンク', code: '09-60L', hex: '#E8A0B8', rgb: { r: 232, g: 160, b: 184 }, munsell: '5RP7/8' },
  { id: '05-30l', name: 'ブラウン', code: '05-30L', hex: '#8B5A3C', rgb: { r: 139, g: 90, b: 60 }, munsell: '5YR4/6' },
  { id: 'n20', name: 'ブラック', code: 'N20', hex: '#333333', rgb: { r: 51, g: 51, b: 51 } },
]

export const roofColors: PaintColor[] = [
  { id: 'no-change', name: '変更なし', code: 'N/A', hex: 'transparent', rgb: { r: 0, g: 0, b: 0 } },
  { id: 'n25', name: 'チャコールブラック', code: 'N25', hex: '#404040', rgb: { r: 64, g: 64, b: 64 } },
  { id: '09-20d', name: 'ブラウン', code: '09-20D', hex: '#6B4423', rgb: { r: 107, g: 68, b: 35 }, munsell: '7.5YR3/6' },
  { id: '45-20d', name: 'ダークブルー', code: '45-20D', hex: '#2C4A5F', rgb: { r: 44, g: 74, b: 95 }, munsell: '10B3/6' },
  { id: '35-30d', name: 'ダークグリーン', code: '35-30D', hex: '#2B5F3F', rgb: { r: 43, g: 95, b: 63 }, munsell: '10GY3/6' },
  { id: '07-30t', name: 'レッドブラウン', code: '07-30T', hex: '#8B3A3A', rgb: { r: 139, g: 58, b: 58 }, munsell: '5R3/8' },
  { id: 'n60', name: 'ミディアムグレー', code: 'N60', hex: '#999999', rgb: { r: 153, g: 153, b: 153 } },
  { id: '15-40v', name: 'オレンジ', code: '15-40V', hex: '#CC7722', rgb: { r: 204, g: 119, b: 34 }, munsell: '7.5YR6/10' },
  { id: '19-60h', name: 'テラコッタ', code: '19-60H', hex: '#B85C43', rgb: { r: 184, g: 92, b: 67 }, munsell: '2.5YR5/10' },
]

export const doorColors: PaintColor[] = [
  { id: 'no-change', name: '変更なし', code: 'N/A', hex: 'transparent', rgb: { r: 0, g: 0, b: 0 } },
  { id: '05-30d', name: 'ダークブラウン', code: '05-30D', hex: '#5C3A28', rgb: { r: 92, g: 58, b: 40 }, munsell: '5YR3/4' },
  { id: '09-40l', name: 'ライトブラウン', code: '09-40L', hex: '#A67C52', rgb: { r: 166, g: 124, b: 82 }, munsell: '7.5YR6/6' },
  { id: 'n90', name: 'ホワイト', code: 'N90', hex: '#E5E5E5', rgb: { r: 229, g: 229, b: 229 } },
  { id: 'n20', name: 'ブラック', code: 'N20', hex: '#333333', rgb: { r: 51, g: 51, b: 51 } },
  { id: '45-30l', name: 'ブルー', code: '45-30L', hex: '#6B9BD2', rgb: { r: 107, g: 155, b: 210 }, munsell: '10B6/8' },
  { id: '35-50p', name: 'グリーン', code: '35-50P', hex: '#7FAA7F', rgb: { r: 127, g: 170, b: 127 }, munsell: '10GY6/6' },
  { id: '07-50t', name: 'レッド', code: '07-50T', hex: '#CC5555', rgb: { r: 204, g: 85, b: 85 }, munsell: '7.5R5/10' },
  { id: '22-70h', name: 'イエロー', code: '22-70H', hex: '#E6C84B', rgb: { r: 230, g: 200, b: 75 }, munsell: '5Y8/8' },
  { id: 'n50', name: 'グレー', code: 'N50', hex: '#808080', rgb: { r: 128, g: 128, b: 128 } },
]