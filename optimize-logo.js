const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeLogo() {
  const inputPath = path.join(__dirname, 'public', 'logo.png');
  const outputDir = path.join(__dirname, 'public');
  
  try {
    console.log('🖼️  ロゴ最適化を開始...');
    console.log(`入力ファイル: ${inputPath}`);
    
    // 元ファイルの情報を取得
    const stats = fs.statSync(inputPath);
    console.log(`元ファイルサイズ: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    
    // 1x サイズ (142x80) WebP
    const logo1xWebp = path.join(outputDir, 'logo-1x.webp');
    await sharp(inputPath)
      .resize(142, 80, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85, effort: 6 })
      .toFile(logo1xWebp);
    
    const stats1xWebp = fs.statSync(logo1xWebp);
    console.log(`✅ 1x WebP作成: ${(stats1xWebp.size / 1024).toFixed(1)}KB`);
    
    // 2x サイズ (284x160) WebP
    const logo2xWebp = path.join(outputDir, 'logo-2x.webp');
    await sharp(inputPath)
      .resize(284, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85, effort: 6 })
      .toFile(logo2xWebp);
    
    const stats2xWebp = fs.statSync(logo2xWebp);
    console.log(`✅ 2x WebP作成: ${(stats2xWebp.size / 1024).toFixed(1)}KB`);
    
    // 1x サイズ (142x80) PNG (フォールバック用)
    const logo1xPng = path.join(outputDir, 'logo-1x.png');
    await sharp(inputPath)
      .resize(142, 80, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, quality: 85 })
      .toFile(logo1xPng);
    
    const stats1xPng = fs.statSync(logo1xPng);
    console.log(`✅ 1x PNG作成: ${(stats1xPng.size / 1024).toFixed(1)}KB`);
    
    // 2x サイズ (284x160) PNG (フォールバック用)
    const logo2xPng = path.join(outputDir, 'logo-2x.png');
    await sharp(inputPath)
      .resize(284, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, quality: 85 })
      .toFile(logo2xPng);
    
    const stats2xPng = fs.statSync(logo2xPng);
    console.log(`✅ 2x PNG作成: ${(stats2xPng.size / 1024).toFixed(1)}KB`);
    
    // 元ファイルのバックアップ
    const backupPath = path.join(outputDir, 'logo-original.png');
    fs.copyFileSync(inputPath, backupPath);
    console.log(`📁 元ファイルをバックアップ: logo-original.png`);
    
    // 最も小さいファイルを新しいlogo.pngとして使用
    const smallestFile = stats1xWebp.size < stats1xPng.size ? logo1xWebp : logo1xPng;
    if (smallestFile.includes('.webp')) {
      // WebPが小さい場合、logo.pngを1x PNGに置き換え
      fs.copyFileSync(logo1xPng, inputPath);
      console.log(`🔄 logo.pngを最適化版（${(stats1xPng.size / 1024).toFixed(1)}KB）に置き換え`);
    }
    
    console.log('🎉 ロゴ最適化完了！');
    console.log('📊 削減効果:');
    console.log(`   元サイズ: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   新サイズ: ${(stats1xPng.size / 1024).toFixed(1)}KB`);
    console.log(`   削減率: ${(((stats.size - stats1xPng.size) / stats.size) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ ロゴ最適化エラー:', error);
    process.exit(1);
  }
}

optimizeLogo();