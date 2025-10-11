/**
 * Web Standard Colors
 * Based on https://vanillaice000.blog.fc2.com/blog-entry-192.html
 * 140 colors organized into 11 categories
 */

export interface WebColor {
  id: string
  englishName: string // CSS color name
  japaneseName: string
  rgb: string // "rgb(r, g, b)" format
  hex: string // "#xxxxxx" format
  category: string
}

export interface ColorCategory {
  name: string
  count: number
  colors: WebColor[]
}

// 赤系 9色
const redColors: WebColor[] = [
  { id: 'lightsalmon', englishName: 'LightSalmon', japaneseName: 'ライトサーモン', rgb: 'rgb(255, 160, 122)', hex: '#ffa07a', category: '赤系' },
  { id: 'salmon', englishName: 'Salmon', japaneseName: 'サーモン', rgb: 'rgb(250, 128, 114)', hex: '#fa8072', category: '赤系' },
  { id: 'darksalmon', englishName: 'DarkSalmon', japaneseName: 'ダークサーモン', rgb: 'rgb(233, 150, 122)', hex: '#e9967a', category: '赤系' },
  { id: 'lightcoral', englishName: 'LightCoral', japaneseName: 'ライトコーラル', rgb: 'rgb(240, 128, 128)', hex: '#f08080', category: '赤系' },
  { id: 'indianred', englishName: 'IndianRed', japaneseName: 'インディアンレッド', rgb: 'rgb(205, 92, 92)', hex: '#cd5c5c', category: '赤系' },
  { id: 'crimson', englishName: 'Crimson', japaneseName: 'クリムゾン', rgb: 'rgb(220, 20, 60)', hex: '#dc143c', category: '赤系' },
  { id: 'red', englishName: 'Red', japaneseName: 'レッド', rgb: 'rgb(255, 0, 0)', hex: '#ff0000', category: '赤系' },
  { id: 'firebrick', englishName: 'FireBrick', japaneseName: 'ファイアブリック', rgb: 'rgb(178, 34, 34)', hex: '#b22222', category: '赤系' },
  { id: 'darkred', englishName: 'DarkRed', japaneseName: 'ダークレッド', rgb: 'rgb(139, 0, 0)', hex: '#8b0000', category: '赤系' },
]

// 橙系 5色
const orangeColors: WebColor[] = [
  { id: 'orange', englishName: 'Orange', japaneseName: 'オレンジ', rgb: 'rgb(255, 165, 0)', hex: '#ffa500', category: '橙系' },
  { id: 'darkorange', englishName: 'DarkOrange', japaneseName: 'ダークオレンジ', rgb: 'rgb(255, 140, 0)', hex: '#ff8c00', category: '橙系' },
  { id: 'coral', englishName: 'Coral', japaneseName: 'コーラル', rgb: 'rgb(255, 127, 80)', hex: '#ff7f50', category: '橙系' },
  { id: 'tomato', englishName: 'Tomato', japaneseName: 'トマト', rgb: 'rgb(255, 99, 71)', hex: '#ff6347', category: '橙系' },
  { id: 'orangered', englishName: 'OrangeRed', japaneseName: 'オレンジレッド', rgb: 'rgb(255, 69, 0)', hex: '#ff4500', category: '橙系' },
]

// 黄系 11色
const yellowColors: WebColor[] = [
  { id: 'gold', englishName: 'Gold', japaneseName: 'ゴールド', rgb: 'rgb(255, 215, 0)', hex: '#ffd700', category: '黄系' },
  { id: 'yellow', englishName: 'Yellow', japaneseName: 'イエロー', rgb: 'rgb(255, 255, 0)', hex: '#ffff00', category: '黄系' },
  { id: 'lightyellow', englishName: 'LightYellow', japaneseName: 'ライトイエロー', rgb: 'rgb(255, 255, 224)', hex: '#ffffe0', category: '黄系' },
  { id: 'lemonchiffon', englishName: 'LemonChiffon', japaneseName: 'レモンシフォン', rgb: 'rgb(255, 250, 205)', hex: '#fffacd', category: '黄系' },
  { id: 'lightgoldenrodyellow', englishName: 'LightGoldenRodYellow', japaneseName: 'ライトゴールデンロッドイエロー', rgb: 'rgb(250, 250, 210)', hex: '#fafad2', category: '黄系' },
  { id: 'papayawhip', englishName: 'PapayaWhip', japaneseName: 'パパヤホィップ', rgb: 'rgb(255, 239, 213)', hex: '#ffefd5', category: '黄系' },
  { id: 'moccasin', englishName: 'Moccasin', japaneseName: 'モカシン', rgb: 'rgb(255, 228, 181)', hex: '#ffe4b5', category: '黄系' },
  { id: 'peachpuff', englishName: 'PeachPuff', japaneseName: 'ピーチパフ', rgb: 'rgb(255, 218, 185)', hex: '#ffdab9', category: '黄系' },
  { id: 'palegoldenrod', englishName: 'PaleGoldenRod', japaneseName: 'ペイルゴールデンロッド', rgb: 'rgb(238, 232, 170)', hex: '#eee8aa', category: '黄系' },
  { id: 'khaki', englishName: 'Khaki', japaneseName: 'カーキ', rgb: 'rgb(240, 230, 140)', hex: '#f0e68c', category: '黄系' },
  { id: 'darkkhaki', englishName: 'DarkKhaki', japaneseName: 'ダークカーキ', rgb: 'rgb(189, 183, 107)', hex: '#bdb76b', category: '黄系' },
]

// 緑系 22色
const greenColors: WebColor[] = [
  { id: 'greenyellow', englishName: 'GreenYellow', japaneseName: 'グリーンイエロー', rgb: 'rgb(173, 255, 47)', hex: '#adff2f', category: '緑系' },
  { id: 'chartreuse', englishName: 'Chartreuse', japaneseName: 'シャルトリューズ', rgb: 'rgb(127, 255, 0)', hex: '#7fff00', category: '緑系' },
  { id: 'lawngreen', englishName: 'LawnGreen', japaneseName: 'ローングリーン', rgb: 'rgb(124, 252, 0)', hex: '#7cfc00', category: '緑系' },
  { id: 'lime', englishName: 'Lime', japaneseName: 'ライム', rgb: 'rgb(0, 255, 0)', hex: '#00ff00', category: '緑系' },
  { id: 'limegreen', englishName: 'LimeGreen', japaneseName: 'ライムグリーン', rgb: 'rgb(50, 205, 50)', hex: '#32cd32', category: '緑系' },
  { id: 'palegreen', englishName: 'PaleGreen', japaneseName: 'ペイルグリーン', rgb: 'rgb(152, 251, 152)', hex: '#98fb98', category: '緑系' },
  { id: 'lightgreen', englishName: 'LightGreen', japaneseName: 'ライトグリーン', rgb: 'rgb(144, 238, 144)', hex: '#90ee90', category: '緑系' },
  { id: 'mediumspringgreen', englishName: 'MediumSpringGreen', japaneseName: 'ミディアムスプリンググリーン', rgb: 'rgb(0, 250, 154)', hex: '#00fa9a', category: '緑系' },
  { id: 'springgreen', englishName: 'SpringGreen', japaneseName: 'スプリンググリーン', rgb: 'rgb(0, 255, 127)', hex: '#00ff7f', category: '緑系' },
  { id: 'mediumseagreen', englishName: 'MediumSeaGreen', japaneseName: 'ミディアムシーグリーン', rgb: 'rgb(60, 179, 113)', hex: '#3cb371', category: '緑系' },
  { id: 'seagreen', englishName: 'SeaGreen', japaneseName: 'シーグリーン', rgb: 'rgb(46, 139, 87)', hex: '#2e8b57', category: '緑系' },
  { id: 'forestgreen', englishName: 'ForestGreen', japaneseName: 'フォレストグリーン', rgb: 'rgb(34, 139, 34)', hex: '#228b22', category: '緑系' },
  { id: 'green', englishName: 'Green', japaneseName: 'グリーン', rgb: 'rgb(0, 128, 0)', hex: '#008000', category: '緑系' },
  { id: 'darkgreen', englishName: 'DarkGreen', japaneseName: 'ダークグリーン', rgb: 'rgb(0, 100, 0)', hex: '#006400', category: '緑系' },
  { id: 'yellowgreen', englishName: 'YellowGreen', japaneseName: 'イエローグリーン', rgb: 'rgb(154, 205, 50)', hex: '#9acd32', category: '緑系' },
  { id: 'olivedrab', englishName: 'OliveDrab', japaneseName: 'オリーブドラブ', rgb: 'rgb(107, 142, 35)', hex: '#6b8e23', category: '緑系' },
  { id: 'darkolivegreen', englishName: 'DarkOliveGreen', japaneseName: 'ダークオリーブグリーン', rgb: 'rgb(85, 107, 47)', hex: '#556b2f', category: '緑系' },
  { id: 'mediumaquamarine', englishName: 'MediumAquaMarine', japaneseName: 'ミディアムアクアマリン', rgb: 'rgb(102, 205, 170)', hex: '#66cdaa', category: '緑系' },
  { id: 'darkseagreen', englishName: 'DarkSeaGreen', japaneseName: 'ダークシーグリーン', rgb: 'rgb(143, 188, 143)', hex: '#8fbc8f', category: '緑系' },
  { id: 'lightseagreen', englishName: 'LightSeaGreen', japaneseName: 'ライトシーグリーン', rgb: 'rgb(32, 178, 170)', hex: '#20b2aa', category: '緑系' },
  { id: 'darkcyan', englishName: 'DarkCyan', japaneseName: 'ダークシアン', rgb: 'rgb(0, 139, 139)', hex: '#008b8b', category: '緑系' },
  { id: 'teal', englishName: 'Teal', japaneseName: 'ティール', rgb: 'rgb(0, 128, 128)', hex: '#008080', category: '緑系' },
]

// 青系 16色
const blueColors: WebColor[] = [
  { id: 'cadetblue', englishName: 'CadetBlue', japaneseName: 'カデットブルー', rgb: 'rgb(95, 158, 160)', hex: '#5f9ea0', category: '青系' },
  { id: 'steelblue', englishName: 'SteelBlue', japaneseName: 'スティールブルー', rgb: 'rgb(70, 130, 180)', hex: '#4682b4', category: '青系' },
  { id: 'lightsteelblue', englishName: 'LightSteelBlue', japaneseName: 'ライトスティールブルー', rgb: 'rgb(176, 196, 222)', hex: '#b0c4de', category: '青系' },
  { id: 'lightblue', englishName: 'LightBlue', japaneseName: 'ライトブルー', rgb: 'rgb(173, 216, 230)', hex: '#add8e6', category: '青系' },
  { id: 'powderblue', englishName: 'PowderBlue', japaneseName: 'パウダーブルー', rgb: 'rgb(176, 224, 230)', hex: '#b0e0e6', category: '青系' },
  { id: 'lightskyblue', englishName: 'LightSkyBlue', japaneseName: 'ライトスカイブルー', rgb: 'rgb(135, 206, 250)', hex: '#87cefa', category: '青系' },
  { id: 'skyblue', englishName: 'SkyBlue', japaneseName: 'スカイブルー', rgb: 'rgb(135, 206, 235)', hex: '#87ceeb', category: '青系' },
  { id: 'cornflowerblue', englishName: 'CornflowerBlue', japaneseName: 'コーンフラワーブルー', rgb: 'rgb(100, 149, 237)', hex: '#6495ed', category: '青系' },
  { id: 'deepskyblue', englishName: 'DeepSkyBlue', japaneseName: 'ディープスカイブルー', rgb: 'rgb(0, 191, 255)', hex: '#00bfff', category: '青系' },
  { id: 'dodgerblue', englishName: 'DodgerBlue', japaneseName: 'ドジャーブルー', rgb: 'rgb(30, 144, 255)', hex: '#1e90ff', category: '青系' },
  { id: 'royalblue', englishName: 'RoyalBlue', japaneseName: 'ロイヤルブルー', rgb: 'rgb(65, 105, 225)', hex: '#4169e1', category: '青系' },
  { id: 'blue', englishName: 'Blue', japaneseName: 'ブルー', rgb: 'rgb(0, 0, 255)', hex: '#0000ff', category: '青系' },
  { id: 'mediumblue', englishName: 'MediumBlue', japaneseName: 'ミディアムブルー', rgb: 'rgb(0, 0, 205)', hex: '#0000cd', category: '青系' },
  { id: 'darkblue', englishName: 'DarkBlue', japaneseName: 'ダークブルー', rgb: 'rgb(0, 0, 139)', hex: '#00008b', category: '青系' },
  { id: 'navy', englishName: 'Navy', japaneseName: 'ネイビー', rgb: 'rgb(0, 0, 128)', hex: '#000080', category: '青系' },
  { id: 'midnightblue', englishName: 'MidnightBlue', japaneseName: 'ミッドナイトブルー', rgb: 'rgb(25, 25, 112)', hex: '#191970', category: '青系' },
]

// シアン系 8色
const cyanColors: WebColor[] = [
  { id: 'aqua', englishName: 'Aqua', japaneseName: 'アクア(シアン同色)', rgb: 'rgb(0, 255, 255)', hex: '#00ffff', category: 'シアン系' },
  { id: 'cyan', englishName: 'Cyan', japaneseName: 'シアン(アクア同色)', rgb: 'rgb(0, 255, 255)', hex: '#00ffff', category: 'シアン系' },
  { id: 'lightcyan', englishName: 'LightCyan', japaneseName: 'ライトシアン', rgb: 'rgb(224, 255, 255)', hex: '#e0ffff', category: 'シアン系' },
  { id: 'paleturquoise', englishName: 'PaleTurquoise', japaneseName: 'ペイルターコイズ', rgb: 'rgb(175, 238, 238)', hex: '#afeeee', category: 'シアン系' },
  { id: 'aquamarine', englishName: 'Aquamarine', japaneseName: 'アクアマリン', rgb: 'rgb(127, 255, 212)', hex: '#7fffd4', category: 'シアン系' },
  { id: 'turquoise', englishName: 'Turquoise', japaneseName: 'ターコイズ', rgb: 'rgb(64, 224, 208)', hex: '#40e0d0', category: 'シアン系' },
  { id: 'mediumturquoise', englishName: 'MediumTurquoise', japaneseName: 'ミディアムターコイズ', rgb: 'rgb(72, 209, 204)', hex: '#48d1cc', category: 'シアン系' },
  { id: 'darkturquoise', englishName: 'DarkTurquoise', japaneseName: 'ダークターコイズ', rgb: 'rgb(0, 206, 209)', hex: '#00ced1', category: 'シアン系' },
]

// 紫系 18色
const purpleColors: WebColor[] = [
  { id: 'lavender', englishName: 'Lavender', japaneseName: 'ラベンダー', rgb: 'rgb(230, 230, 250)', hex: '#e6e6fa', category: '紫系' },
  { id: 'thistle', englishName: 'Thistle', japaneseName: 'シスル', rgb: 'rgb(216, 191, 216)', hex: '#d8bfd8', category: '紫系' },
  { id: 'plum', englishName: 'Plum', japaneseName: 'プラム', rgb: 'rgb(221, 160, 221)', hex: '#dda0dd', category: '紫系' },
  { id: 'orchid', englishName: 'Orchid', japaneseName: 'オーキッド', rgb: 'rgb(218, 112, 214)', hex: '#da70d6', category: '紫系' },
  { id: 'violet', englishName: 'Violet', japaneseName: 'バイオレット', rgb: 'rgb(238, 130, 238)', hex: '#ee82ee', category: '紫系' },
  { id: 'fuchsia', englishName: 'Fuchsia', japaneseName: 'フューシャ(マジェンタ同色)', rgb: 'rgb(255, 0, 255)', hex: '#ff00ff', category: '紫系' },
  { id: 'magenta', englishName: 'Magenta', japaneseName: 'マジェンタ(フューシャ同色)', rgb: 'rgb(255, 0, 255)', hex: '#ff00ff', category: '紫系' },
  { id: 'mediumorchid', englishName: 'MediumOrchid', japaneseName: 'ミディアムオーキッド', rgb: 'rgb(186, 85, 211)', hex: '#ba55d3', category: '紫系' },
  { id: 'darkorchid', englishName: 'DarkOrchid', japaneseName: 'ダークオーキッド', rgb: 'rgb(153, 50, 204)', hex: '#9932cc', category: '紫系' },
  { id: 'darkviolet', englishName: 'DarkViolet', japaneseName: 'ダークバイオレット', rgb: 'rgb(148, 0, 211)', hex: '#9400d3', category: '紫系' },
  { id: 'blueviolet', englishName: 'BlueViolet', japaneseName: 'ブルーバイオレット', rgb: 'rgb(138, 43, 226)', hex: '#8a2be2', category: '紫系' },
  { id: 'darkmagenta', englishName: 'DarkMagenta', japaneseName: 'ダークマジェンタ', rgb: 'rgb(139, 0, 139)', hex: '#8b008b', category: '紫系' },
  { id: 'purple', englishName: 'Purple', japaneseName: 'パープル', rgb: 'rgb(128, 0, 128)', hex: '#800080', category: '紫系' },
  { id: 'mediumpurple', englishName: 'MediumPurple', japaneseName: 'ミディアムパープル', rgb: 'rgb(147, 112, 219)', hex: '#9370db', category: '紫系' },
  { id: 'mediumslateblue', englishName: 'MediumSlateBlue', japaneseName: 'ミディアムスレートブルー', rgb: 'rgb(123, 104, 238)', hex: '#7b68ee', category: '紫系' },
  { id: 'slateblue', englishName: 'SlateBlue', japaneseName: 'スレートブルー', rgb: 'rgb(106, 90, 205)', hex: '#6a5acd', category: '紫系' },
  { id: 'darkslateblue', englishName: 'DarkSlateBlue', japaneseName: 'ダークスレートブルー', rgb: 'rgb(72, 61, 139)', hex: '#483d8b', category: '紫系' },
  { id: 'indigo', englishName: 'Indigo', japaneseName: 'インディゴ', rgb: 'rgb(75, 0, 130)', hex: '#4b0082', category: '紫系' },
]

// ピンク系 6色
const pinkColors: WebColor[] = [
  { id: 'pink', englishName: 'Pink', japaneseName: 'ピンク', rgb: 'rgb(255, 192, 203)', hex: '#ffc0cb', category: 'ピンク系' },
  { id: 'lightpink', englishName: 'LightPink', japaneseName: 'ライトピンク', rgb: 'rgb(255, 182, 193)', hex: '#ffb6c1', category: 'ピンク系' },
  { id: 'hotpink', englishName: 'HotPink', japaneseName: 'ホットピンク', rgb: 'rgb(255, 105, 180)', hex: '#ff69b4', category: 'ピンク系' },
  { id: 'deeppink', englishName: 'DeepPink', japaneseName: 'ディープピンク', rgb: 'rgb(255, 20, 147)', hex: '#ff1493', category: 'ピンク系' },
  { id: 'palevioletred', englishName: 'PaleVioletRed', japaneseName: 'ペイルバイオレットレッド', rgb: 'rgb(219, 112, 147)', hex: '#db7093', category: 'ピンク系' },
  { id: 'mediumvioletred', englishName: 'MediumVioletRed', japaneseName: 'ミディアムバイオレットレッド', rgb: 'rgb(199, 21, 133)', hex: '#c71585', category: 'ピンク系' },
]

// 茶系 18色
const brownColors: WebColor[] = [
  { id: 'cornsilk', englishName: 'Cornsilk', japaneseName: 'コーンシルク', rgb: 'rgb(255, 248, 220)', hex: '#fff8dc', category: '茶系' },
  { id: 'blanchedalmond', englishName: 'BlanchedAlmond', japaneseName: 'ブランチドアーモンド', rgb: 'rgb(255, 235, 205)', hex: '#ffebcd', category: '茶系' },
  { id: 'bisque', englishName: 'Bisque', japaneseName: 'ビスク', rgb: 'rgb(255, 228, 196)', hex: '#ffe4c4', category: '茶系' },
  { id: 'navajowhite', englishName: 'NavajoWhite', japaneseName: 'ナバホホワイト', rgb: 'rgb(255, 222, 173)', hex: '#ffdead', category: '茶系' },
  { id: 'wheat', englishName: 'Wheat', japaneseName: 'ウィート', rgb: 'rgb(245, 222, 179)', hex: '#f5deb3', category: '茶系' },
  { id: 'burlywood', englishName: 'BurlyWood', japaneseName: 'バーリーウッド', rgb: 'rgb(222, 184, 135)', hex: '#deb887', category: '茶系' },
  { id: 'tan', englishName: 'Tan', japaneseName: 'タン', rgb: 'rgb(210, 180, 140)', hex: '#d2b48c', category: '茶系' },
  { id: 'rosybrown', englishName: 'RosyBrown', japaneseName: 'ロージーブラウン', rgb: 'rgb(188, 143, 143)', hex: '#bc8f8f', category: '茶系' },
  { id: 'sandybrown', englishName: 'SandyBrown', japaneseName: 'サンディブラウン', rgb: 'rgb(244, 164, 96)', hex: '#f4a460', category: '茶系' },
  { id: 'goldenrod', englishName: 'GoldenRod', japaneseName: 'ゴールデンロッド', rgb: 'rgb(218, 165, 32)', hex: '#daa520', category: '茶系' },
  { id: 'darkgoldenrod', englishName: 'DarkGoldenRod', japaneseName: 'ダークゴールデンロッド', rgb: 'rgb(184, 134, 11)', hex: '#b8860b', category: '茶系' },
  { id: 'peru', englishName: 'Peru', japaneseName: 'ペルー', rgb: 'rgb(205, 133, 63)', hex: '#cd853f', category: '茶系' },
  { id: 'chocolate', englishName: 'Chocolate', japaneseName: 'チョコレート', rgb: 'rgb(210, 105, 30)', hex: '#d2691e', category: '茶系' },
  { id: 'olive', englishName: 'Olive', japaneseName: 'オリーブ', rgb: 'rgb(128, 128, 0)', hex: '#808000', category: '茶系' },
  { id: 'saddlebrown', englishName: 'SaddleBrown', japaneseName: 'サドルブラウン', rgb: 'rgb(139, 69, 19)', hex: '#8b4513', category: '茶系' },
  { id: 'sienna', englishName: 'Sienna', japaneseName: 'シエナ', rgb: 'rgb(160, 82, 45)', hex: '#a0522d', category: '茶系' },
  { id: 'brown', englishName: 'Brown', japaneseName: 'ブラウン', rgb: 'rgb(165, 42, 42)', hex: '#a52a2a', category: '茶系' },
  { id: 'maroon', englishName: 'Maroon', japaneseName: 'マルーン', rgb: 'rgb(128, 0, 0)', hex: '#800000', category: '茶系' },
]

// 白系 17色
const whiteColors: WebColor[] = [
  { id: 'white', englishName: 'White', japaneseName: 'ホワイト', rgb: 'rgb(255, 255, 255)', hex: '#ffffff', category: '白系' },
  { id: 'snow', englishName: 'Snow', japaneseName: 'スノウ', rgb: 'rgb(255, 250, 250)', hex: '#fffafa', category: '白系' },
  { id: 'honeydew', englishName: 'HoneyDew', japaneseName: 'ハニーデュー', rgb: 'rgb(240, 255, 240)', hex: '#f0fff0', category: '白系' },
  { id: 'mintcream', englishName: 'MintCream', japaneseName: 'ミントクリーム', rgb: 'rgb(245, 255, 250)', hex: '#f5fffa', category: '白系' },
  { id: 'azure', englishName: 'Azure', japaneseName: 'アジュール', rgb: 'rgb(240, 255, 255)', hex: '#f0ffff', category: '白系' },
  { id: 'aliceblue', englishName: 'AliceBlue', japaneseName: 'アリスブルー', rgb: 'rgb(240, 248, 255)', hex: '#f0f8ff', category: '白系' },
  { id: 'ghostwhite', englishName: 'GhostWhite', japaneseName: 'ゴーストホワイト', rgb: 'rgb(248, 248, 255)', hex: '#f8f8ff', category: '白系' },
  { id: 'whitesmoke', englishName: 'WhiteSmoke', japaneseName: 'ホワイトスモーク', rgb: 'rgb(245, 245, 245)', hex: '#f5f5f5', category: '白系' },
  { id: 'seashell', englishName: 'SeaShell', japaneseName: 'シーシェル', rgb: 'rgb(255, 245, 238)', hex: '#fff5ee', category: '白系' },
  { id: 'beige', englishName: 'Beige', japaneseName: 'ベージュ', rgb: 'rgb(245, 245, 220)', hex: '#f5f5dc', category: '白系' },
  { id: 'oldlace', englishName: 'OldLace', japaneseName: 'オールドレース', rgb: 'rgb(253, 245, 230)', hex: '#fdf5e6', category: '白系' },
  { id: 'floralwhite', englishName: 'FloralWhite', japaneseName: 'フローラルホワイト', rgb: 'rgb(255, 250, 240)', hex: '#fffaf0', category: '白系' },
  { id: 'ivory', englishName: 'Ivory', japaneseName: 'アイボリー', rgb: 'rgb(255, 255, 240)', hex: '#fffff0', category: '白系' },
  { id: 'antiquewhite', englishName: 'AntiqueWhite', japaneseName: 'アンティークホワイト', rgb: 'rgb(250, 235, 215)', hex: '#faebd7', category: '白系' },
  { id: 'linen', englishName: 'Linen', japaneseName: 'リネン', rgb: 'rgb(250, 240, 230)', hex: '#faf0e6', category: '白系' },
  { id: 'lavenderblush', englishName: 'LavenderBlush', japaneseName: 'ラベンダーブラッシュ', rgb: 'rgb(255, 240, 245)', hex: '#fff0f5', category: '白系' },
  { id: 'mistyrose', englishName: 'MistyRose', japaneseName: 'ミスティローズ', rgb: 'rgb(255, 228, 225)', hex: '#ffe4e1', category: '白系' },
]

// グレー系 10色
const grayColors: WebColor[] = [
  { id: 'gainsboro', englishName: 'Gainsboro', japaneseName: 'ゲインズボロ', rgb: 'rgb(220, 220, 220)', hex: '#dcdcdc', category: 'グレー系' },
  { id: 'lightgray', englishName: 'LightGray', japaneseName: 'ライトグレー', rgb: 'rgb(211, 211, 211)', hex: '#d3d3d3', category: 'グレー系' },
  { id: 'silver', englishName: 'Silver', japaneseName: 'シルバー', rgb: 'rgb(192, 192, 192)', hex: '#c0c0c0', category: 'グレー系' },
  { id: 'darkgray', englishName: 'DarkGray', japaneseName: 'ダークグレー', rgb: 'rgb(169, 169, 169)', hex: '#a9a9a9', category: 'グレー系' },
  { id: 'dimgray', englishName: 'DimGray', japaneseName: 'ディムグレー', rgb: 'rgb(105, 105, 105)', hex: '#696969', category: 'グレー系' },
  { id: 'gray', englishName: 'Gray', japaneseName: 'グレー', rgb: 'rgb(128, 128, 128)', hex: '#808080', category: 'グレー系' },
  { id: 'lightslategray', englishName: 'LightSlateGray', japaneseName: 'ライトスレートグレー', rgb: 'rgb(119, 136, 153)', hex: '#778899', category: 'グレー系' },
  { id: 'slategray', englishName: 'SlateGray', japaneseName: 'スレートグレー', rgb: 'rgb(112, 128, 144)', hex: '#708090', category: 'グレー系' },
  { id: 'darkslategray', englishName: 'DarkSlateGray', japaneseName: 'ダークスレートグレー', rgb: 'rgb(47, 79, 79)', hex: '#2f4f4f', category: 'グレー系' },
  { id: 'black', englishName: 'Black', japaneseName: 'ブラック', rgb: 'rgb(0, 0, 0)', hex: '#000000', category: 'グレー系' },
]

// All colors combined
export const allWebColors: WebColor[] = [
  ...redColors,
  ...orangeColors,
  ...yellowColors,
  ...greenColors,
  ...blueColors,
  ...cyanColors,
  ...purpleColors,
  ...pinkColors,
  ...brownColors,
  ...whiteColors,
  ...grayColors,
]

// Categories for navigation
export const colorCategories: ColorCategory[] = [
  { name: '赤系', count: 9, colors: redColors },
  { name: '橙系', count: 5, colors: orangeColors },
  { name: '黄系', count: 11, colors: yellowColors },
  { name: '緑系', count: 22, colors: greenColors },
  { name: '青系', count: 16, colors: blueColors },
  { name: 'シアン系', count: 8, colors: cyanColors },
  { name: '紫系', count: 18, colors: purpleColors },
  { name: 'ピンク系', count: 6, colors: pinkColors },
  { name: '茶系', count: 18, colors: brownColors },
  { name: '白系', count: 17, colors: whiteColors },
  { name: 'グレー系', count: 10, colors: grayColors },
]

// Utility function to get color by ID
export function getWebColorById(id: string): WebColor | undefined {
  if (id === 'no-change') {
    return {
      id: 'no-change',
      englishName: 'No Change',
      japaneseName: '変更なし',
      rgb: 'rgb(0, 0, 0)',
      hex: 'transparent',
      category: 'その他'
    }
  }
  return allWebColors.find(color => color.id === id)
}

// Utility function to format color for prompt
export function formatColorForPrompt(color: WebColor): string {
  if (color.id === 'no-change') {
    return ''
  }
  return `色名: ${color.japaneseName}, RGB: ${color.rgb}, カラーコード: ${color.hex}`
}

// Utility function to convert WebColor to ColorData for AI providers
export function webColorToColorData(webColor: WebColor): {
  name: string
  code: string
  hex: string
  rgb: { r: number; g: number; b: number }
} {
  // Parse rgb string "rgb(r, g, b)" to object
  const rgbMatch = webColor.rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  const rgb = rgbMatch
    ? { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
    : { r: 0, g: 0, b: 0 }

  return {
    name: webColor.japaneseName,
    code: webColor.id,
    hex: webColor.hex,
    rgb
  }
}
