const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeBackgroundImage() {
  const inputPath = path.join(__dirname, '..', 'public', 'Paintly-haikei.png');
  const outputWebP = path.join(__dirname, '..', 'public', 'Paintly-haikei.webp');

  console.log('🎨 Paintly画像最適化開始...');

  try {
    // WebP変換（高品質、サイズ最適化）
    await sharp(inputPath)
      .resize(828, null, { // モバイルファースト: 828px幅に最適化
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({
        quality: 80, // 視覚品質を保ちつつ圧縮
        effort: 6    // 最適な圧縮アルゴリズム
      })
      .toFile(outputWebP);

    const originalStats = fs.statSync(inputPath);
    const webpStats = fs.statSync(outputWebP);

    const reduction = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
    const savedKB = ((originalStats.size - webpStats.size) / 1024).toFixed(1);

    console.log('✅ WebP変換完了');
    console.log(`📊 元ファイル: ${(originalStats.size / 1024).toFixed(1)} KB`);
    console.log(`📊 WebPファイル: ${(webpStats.size / 1024).toFixed(1)} KB`);
    console.log(`💾 削減: ${savedKB} KB (${reduction}%)`);

  } catch (error) {
    console.error('❌ 画像最適化エラー:', error);
    process.exit(1);
  }
}

optimizeBackgroundImage();
