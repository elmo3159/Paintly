const sharp = require('sharp');
const path = require('path');

async function resizeImage() {
  const inputPath = path.join(__dirname, 'public', 'LP-Before2.png');
  const outputPath = path.join(__dirname, 'public', 'LP-Before2.png');
  const backupPath = path.join(__dirname, 'public', 'LP-Before2-original.png');

  try {
    // 元の画像をバックアップ
    await sharp(inputPath)
      .toFile(backupPath);
    console.log('✓ 元画像をバックアップしました: LP-Before2-original.png');

    // 画像を1024x1024にリサイズ
    await sharp(inputPath)
      .resize(1024, 1024, {
        fit: 'cover', // アスペクト比を維持しながらクロップ
        position: 'center'
      })
      .png({
        quality: 90,
        compressionLevel: 9 // 最高圧縮
      })
      .toFile(outputPath + '.tmp');

    // 一時ファイルを元のファイル名にリネーム
    const fs = require('fs');
    fs.renameSync(outputPath + '.tmp', outputPath);

    console.log('✓ LP-Before2.pngを1024x1024にリサイズしました');

    // リサイズ後のファイルサイズを確認
    const stats = fs.statSync(outputPath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  新しいファイルサイズ: ${sizeInMB}MB`);

    console.log('\n✅ 最適化完了！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

resizeImage();
