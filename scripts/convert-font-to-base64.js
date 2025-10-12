/**
 * TTFフォントファイルをBase64に変換するスクリプト
 *
 * 使用方法:
 * 1. Google Fonts Helper (https://gwfh.mranftl.com/fonts/noto-sans-jp) から
 *    Noto Sans JP の Regular (400) .ttf ファイルをダウンロード
 * 2. このスクリプトと同じディレクトリに "NotoSansJP-Regular.ttf" として保存
 * 3. node scripts/convert-font-to-base64.js を実行
 * 4. 生成された lib/fonts/noto-sans-jp-base64.ts をインポートして使用
 */

const fs = require('fs');
const path = require('path');

const inputFontPath = path.join(__dirname, 'NotoSansJP-Regular.ttf');
const outputFilePath = path.join(__dirname, '..', 'lib', 'fonts', 'noto-sans-jp-base64.ts');

try {
  // TTFファイルを読み込む
  if (!fs.existsSync(inputFontPath)) {
    console.error('❌ フォントファイルが見つかりません:');
    console.error('   ', inputFontPath);
    console.error('');
    console.error('📥 以下の手順でフォントをダウンロードしてください:');
    console.error('   1. https://gwfh.mranftl.com/fonts/noto-sans-jp にアクセス');
    console.error('   2. "noto-sans-jp-v52-latin_japanese-regular" の .ttf をダウンロード');
    console.error('   3. ファイル名を "NotoSansJP-Regular.ttf" に変更');
    console.error('   4. scripts/ フォルダに配置');
    console.error('   5. このスクリプトを再実行');
    process.exit(1);
  }

  console.log('📖 フォントファイルを読み込み中...');
  const fontBuffer = fs.readFileSync(inputFontPath);

  console.log('🔄 Base64に変換中...');
  const base64Font = fontBuffer.toString('base64');

  // lib/fonts ディレクトリを作成（存在しない場合）
  const fontsDir = path.join(__dirname, '..', 'lib', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  // TypeScriptファイルとして出力
  const tsContent = `/**
 * Noto Sans JP Regular フォント (Base64エンコード済み)
 *
 * このファイルは自動生成されています。
 * 再生成: node scripts/convert-font-to-base64.js
 *
 * ライセンス: SIL Open Font License 1.1
 * https://fonts.google.com/noto/specimen/Noto+Sans+JP
 */

export const NotoSansJPRegularBase64 = '${base64Font}';
`;

  console.log('💾 TypeScriptファイルを生成中...');
  fs.writeFileSync(outputFilePath, tsContent, 'utf8');

  const fileSizeMB = (base64Font.length / 1024 / 1024).toFixed(2);

  console.log('');
  console.log('✅ フォント変換完了！');
  console.log('   出力ファイル:', outputFilePath);
  console.log('   ファイルサイズ:', fileSizeMB, 'MB (Base64)');
  console.log('');
  console.log('📝 次のステップ:');
  console.log('   lib/pdf-export.ts で以下のようにインポートして使用:');
  console.log('');
  console.log('   import { NotoSansJPRegularBase64 } from "./fonts/noto-sans-jp-base64"');
  console.log('   ');
  console.log('   doc.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJPRegularBase64)');
  console.log('   doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal")');
  console.log('   doc.setFont("NotoSansJP")');
  console.log('');

} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}
