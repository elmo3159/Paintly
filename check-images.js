const fs = require('fs');
const path = require('path');

// PNG画像のサイズを読み取る関数
function getPNGSize(buffer) {
  // PNGヘッダーをチェック
  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error('Not a valid PNG file');
  }

  // IHDRチャンクから幅と高さを取得（ビッグエンディアン）
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

// JPEG画像のサイズを読み取る関数
function getJPEGSize(buffer) {
  let offset = 2; // JPEGヘッダーをスキップ

  while (offset < buffer.length) {
    // マーカーを探す
    if (buffer[offset] !== 0xFF) break;

    const marker = buffer[offset + 1];
    offset += 2;

    // SOF (Start Of Frame) マーカーを探す
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }

    // 次のマーカーへ
    const length = buffer.readUInt16BE(offset);
    offset += length;
  }

  throw new Error('Could not find JPEG dimensions');
}

// public ディレクトリ内の LP-*.png と LP-*.jpg ファイルを検索
const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(file =>
  (file.startsWith('LP-') && (file.endsWith('.png') || file.endsWith('.jpg')))
);

console.log('画像ファイルの解像度:');
console.log('='.repeat(60));

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  const buffer = fs.readFileSync(filePath);
  const stats = fs.statSync(filePath);

  try {
    let dimensions;
    if (file.endsWith('.png')) {
      dimensions = getPNGSize(buffer);
    } else if (file.endsWith('.jpg')) {
      dimensions = getJPEGSize(buffer);
    }

    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`${file}: ${dimensions.width}x${dimensions.height} pixels (${sizeInMB}MB)`);
  } catch (error) {
    console.log(`${file}: エラー - ${error.message}`);
  }
});

console.log('='.repeat(60));
