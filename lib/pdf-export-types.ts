/**
 * PDFエクスポート用の型定義
 * pdf-exportモジュールから分離して、型だけを安全にインポート可能にする
 */

export interface ExportImageData {
  originalUrl: string
  generatedUrl: string
  wallColor?: string | null
  roofColor?: string | null
  doorColor?: string | null
  weather?: string | null
  createdAt: string
}
