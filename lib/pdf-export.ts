/**
 * PDFエクスポート機能
 * jsPDFを使用してビフォーアフター画像をPDFに出力
 */

import type { ExportImageData } from './pdf-export-types'

// jsPDFは動的インポートで読み込みます（静的インポートだとモジュール評価時にエラーが発生するため）

// フォントをキャッシュ
let cachedFontBase64: string | null = null

/**
 * フォントを動的に読み込んでBase64に変換
 * 初回のみダウンロードし、以降はキャッシュを使用
 */
async function loadFontBase64(): Promise<string> {
  if (cachedFontBase64) {
    return cachedFontBase64
  }

  try {
    const response = await fetch('/fonts/NotoSansJP-Regular.ttf')

    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // ArrayBufferをBase64に変換
    let binary = ''
    const len = uint8Array.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }

    cachedFontBase64 = btoa(binary)
    console.log(`✅ Font loaded: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`)

    return cachedFontBase64
  } catch (error) {
    console.error('❌ Failed to load font:', error)
    throw new Error('Failed to load Japanese font for PDF')
  }
}

// 型定義は pdf-export-types.ts に移動
export type { ExportImageData } from './pdf-export-types'

/**
 * 画像URLをBase64に変換
 * API Route経由でサーバーサイドから取得（CORS問題を回避）
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch('/api/image-to-base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.dataUrl) {
      throw new Error('Invalid response from image conversion API')
    }

    return data.dataUrl
  } catch (error) {
    console.error('Error converting image to base64:', error)
    throw error
  }
}

/**
 * Base64画像から幅と高さを取得
 */
async function getImageDimensions(base64Data: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = base64Data
  })
}

/**
 * ビフォーアフター画像を1つのPDFにエクスポート
 */
export async function exportSingleGenerationToPdf(
  data: ExportImageData,
  filename?: string
): Promise<void> {
  try {
    // jsPDFを動的にインポート
    const { jsPDF } = await import('jspdf')
    
    // 日本語フォントを動的に読み込み
    const fontBase64 = await loadFontBase64()

    // PDF作成（A4サイズ、縦向き）
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // 日本語フォントを追加
    doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64)
    doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal')
    doc.setFont('NotoSansJP', 'normal')

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)

    // タイトル
    doc.setFontSize(18)
    doc.setFont('NotoSansJP', 'normal')
    doc.text('Paintly - シミュレーション結果', margin, margin + 10)

    // 生成日時
    doc.setFontSize(10)
    doc.setFont('NotoSansJP', 'normal')
    const dateStr = new Date(data.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`生成日時: ${dateStr}`, margin, margin + 18)

    // 色情報
    let yPos = margin + 26
    doc.setFontSize(11)
    doc.setFont('NotoSansJP', 'normal')
    doc.text('選択した色:', margin, yPos)

    yPos += 6
    doc.setFont('NotoSansJP', 'normal')
    doc.setFontSize(10)

    if (data.wallColor && data.wallColor !== '変更なし') {
      doc.text(`壁: ${data.wallColor}`, margin + 5, yPos)
      yPos += 5
    }
    if (data.roofColor && data.roofColor !== '変更なし') {
      doc.text(`屋根: ${data.roofColor}`, margin + 5, yPos)
      yPos += 5
    }
    if (data.doorColor && data.doorColor !== '変更なし') {
      doc.text(`ドア: ${data.doorColor}`, margin + 5, yPos)
      yPos += 5
    }
    if (data.weather) {
      doc.text(`天候: ${data.weather}`, margin + 5, yPos)
      yPos += 5
    }

    yPos += 10

    // オリジナル画像
    doc.setFont('NotoSansJP', 'normal')
    doc.setFontSize(12)
    doc.text('オリジナル画像', margin, yPos)
    yPos += 5

    const originalBase64 = await imageUrlToBase64(data.originalUrl)
    const originalDimensions = await getImageDimensions(originalBase64)
    const originalAspectRatio = originalDimensions.width / originalDimensions.height
    const originalImageHeight = contentWidth / originalAspectRatio
    doc.addImage(originalBase64, 'JPEG', margin, yPos, contentWidth, originalImageHeight)
    yPos += originalImageHeight + 10

    // 生成画像（新しいページに）
    doc.addPage()
    yPos = margin + 10

    doc.setFont('NotoSansJP', 'normal')
    doc.setFontSize(12)
    doc.text('生成画像（シミュレーション結果）', margin, yPos)
    yPos += 5

    const generatedBase64 = await imageUrlToBase64(data.generatedUrl)
    const generatedDimensions = await getImageDimensions(generatedBase64)
    const generatedAspectRatio = generatedDimensions.width / generatedDimensions.height
    const generatedImageHeight = contentWidth / generatedAspectRatio
    doc.addImage(generatedBase64, 'JPEG', margin, yPos, contentWidth, generatedImageHeight)

    // フッター
    const footerY = pageHeight - 10
    doc.setFontSize(8)
    doc.setFont('NotoSansJP', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text('Generated by Paintly - https://paintly.app', pageWidth / 2, footerY, { align: 'center' })

    // PDF保存
    const pdfFilename = filename || `paintly_simulation_${new Date().getTime()}.pdf`
    doc.save(pdfFilename)

    console.log('✅ PDF exported successfully:', pdfFilename)
  } catch (error) {
    console.error('❌ PDF export failed:', error)
    throw error
  }
}

/**
 * 複数の生成結果をまとめて1つのPDFにエクスポート
 */
export async function exportMultipleGenerationsToPdf(
  dataList: ExportImageData[],
  filename?: string
): Promise<void> {
  try {
    // jsPDFを動的にインポート
    const { jsPDF } = await import('jspdf')
    
    // 日本語フォントを動的に読み込み
    const fontBase64 = await loadFontBase64()

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // 日本語フォントを追加
    doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64)
    doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal')
    doc.setFont('NotoSansJP', 'normal')

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)

    // カバーページ
    doc.setFontSize(24)
    doc.setFont('NotoSansJP', 'normal')
    doc.text('Paintly', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' })

    doc.setFontSize(16)
    doc.setFont('NotoSansJP', 'normal')
    doc.text('シミュレーション結果レポート', pageWidth / 2, pageHeight / 2, { align: 'center' })

    doc.setFontSize(12)
    doc.text(`全${dataList.length}件`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' })

    const reportDate = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.setFontSize(10)
    doc.text(`作成日: ${reportDate}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' })

    // 各生成結果をページに追加
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i]

      doc.addPage()
      let yPos = margin + 10

      // ページ番号とタイトル
      doc.setFontSize(14)
      doc.setFont('NotoSansJP', 'normal')
      doc.text(`シミュレーション ${i + 1}/${dataList.length}`, margin, yPos)
      yPos += 8

      // 生成日時
      doc.setFontSize(9)
      doc.setFont('NotoSansJP', 'normal')
      const dateStr = new Date(data.createdAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`生成日時: ${dateStr}`, margin, yPos)
      yPos += 10

      // 色情報
      doc.setFontSize(10)
      doc.setFont('NotoSansJP', 'normal')
      doc.text('選択した色:', margin, yPos)
      yPos += 5

      doc.setFont('NotoSansJP', 'normal')
      doc.setFontSize(9)

      if (data.wallColor && data.wallColor !== '変更なし') {
        doc.text(`壁: ${data.wallColor}`, margin + 5, yPos)
        yPos += 4
      }
      if (data.roofColor && data.roofColor !== '変更なし') {
        doc.text(`屋根: ${data.roofColor}`, margin + 5, yPos)
        yPos += 4
      }
      if (data.doorColor && data.doorColor !== '変更なし') {
        doc.text(`ドア: ${data.doorColor}`, margin + 5, yPos)
        yPos += 4
      }
      if (data.weather) {
        doc.text(`天候: ${data.weather}`, margin + 5, yPos)
        yPos += 4
      }

      yPos += 6

      // 画像（オリジナルと生成画像を並べて表示）
      const imageWidth = (contentWidth - 5) / 2

      // オリジナル画像
      doc.setFont('NotoSansJP', 'normal')
      doc.setFontSize(10)
      doc.text('オリジナル', margin, yPos)
      yPos += 4

      const originalBase64 = await imageUrlToBase64(data.originalUrl)
      const originalDimensions = await getImageDimensions(originalBase64)
      const originalAspectRatio = originalDimensions.width / originalDimensions.height
      const originalImageHeight = imageWidth / originalAspectRatio
      doc.addImage(originalBase64, 'JPEG', margin, yPos, imageWidth, originalImageHeight)

      // 生成画像
      doc.text('シミュレーション結果', margin + imageWidth + 5, yPos - 4)

      const generatedBase64 = await imageUrlToBase64(data.generatedUrl)
      const generatedDimensions = await getImageDimensions(generatedBase64)
      const generatedAspectRatio = generatedDimensions.width / generatedDimensions.height
      const generatedImageHeight = imageWidth / generatedAspectRatio
      doc.addImage(generatedBase64, 'JPEG', margin + imageWidth + 5, yPos, imageWidth, generatedImageHeight)
    }

    // フッター（全ページに）
    const totalPages = doc.internal.pages.length - 1 // -1 for the first empty page
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const footerY = pageHeight - 10
      doc.setFontSize(8)
      doc.setFont('NotoSansJP', 'normal')
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generated by Paintly - Page ${i}/${totalPages}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      )
    }

    // PDF保存
    const pdfFilename = filename || `paintly_report_${new Date().getTime()}.pdf`
    doc.save(pdfFilename)

    console.log('✅ Multiple generations PDF exported successfully:', pdfFilename)
  } catch (error) {
    console.error('❌ Multiple generations PDF export failed:', error)
    throw error
  }
}
