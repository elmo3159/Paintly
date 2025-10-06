#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generatePWAIcons() {
  const inputPath = path.join(__dirname, '../public/logo.png');
  const outputDir = path.join(__dirname, '../public');
  
  // 生成するアイコンサイズ
  const sizes = [
    { size: 96, name: 'icon-96.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' }
  ];
  
  console.log('🎨 PWAアイコン生成開始...');
  
  try {
    // 入力ファイルの存在確認
    if (!fs.existsSync(inputPath)) {
      throw new Error(`入力ファイルが見つかりません: ${inputPath}`);
    }
    
    // 各サイズのアイコンを生成
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90 })
        .toFile(outputPath);
        
      console.log(`✅ ${name} (${size}x${size}) 生成完了`);
    }
    
    console.log('🎉 PWAアイコン生成完了！');
    
  } catch (error) {
    console.error('❌ アイコン生成エラー:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  generatePWAIcons();
}

module.exports = { generatePWAIcons };