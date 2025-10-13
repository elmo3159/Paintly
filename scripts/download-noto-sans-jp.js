/**
 * Noto Sans JP Regular フォントをGoogle Fontsからダウンロードして
 * Base64エンコードしたTypeScriptファイルを生成するスクリプト
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 出力先ファイルパス
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'fonts');
const OUTPUT_TTF_FILE = path.join(PUBLIC_DIR, 'NotoSansJP-Regular.ttf');

// GitHub経由でNoto Sans JP Regular TTFを直接ダウンロード
// Google Fontsの公式GitHubリポジトリから
const FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf';

console.log('📥 Downloading Noto Sans JP Variable Font from GitHub...');

// フォントファイルを直接ダウンロード
https.get(FONT_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (fontRes) => {
  // リダイレクトに対応
  if (fontRes.statusCode === 302 || fontRes.statusCode === 301) {
    const redirectUrl = fontRes.headers.location;
    console.log(`↪️  Following redirect: ${redirectUrl}`);

    https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (redirectRes) => {
      processFont(redirectRes);
    }).on('error', (err) => {
      console.error('❌ Error following redirect:', err.message);
      process.exit(1);
    });
    return;
  }

  processFont(fontRes);
}).on('error', (err) => {
  console.error('❌ Error downloading font:', err.message);
  process.exit(1);
});

function processFont(fontRes) {
  const chunks = [];

  fontRes.on('data', chunk => chunks.push(chunk));

  fontRes.on('end', () => {
    const fontBuffer = Buffer.concat(chunks);

    if (fontBuffer.length < 1000) {
      console.error('❌ Downloaded file is too small, likely not a valid font');
      console.error(`Received: ${fontBuffer.toString('utf8').substring(0, 200)}`);
      process.exit(1);
    }

    console.log(`✅ Font downloaded: ${(fontBuffer.length / 1024).toFixed(2)} KB`);

    // 出力ディレクトリを作成
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // TTFファイルとして直接保存
    fs.writeFileSync(OUTPUT_TTF_FILE, fontBuffer);

    console.log(`✅ Saved TTF file: ${OUTPUT_TTF_FILE}`);
    console.log('🎉 Font download completed successfully!');
    console.log('📝 Font will be loaded dynamically at runtime');

    process.exit(0);
  });
}
