'use client'

import { useState } from 'react'

export default function TestPdfPage() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleTestPdf = async () => {
    setStatus('PDF生成中...')
    setError('')

    try {
      // 画像なしでテキストのみのPDFを生成してフォント表示をテスト
      const { jsPDF } = await import('jspdf')

      // フォントロード（pdf-export.tsと同じロジック）
      const response = await fetch('/fonts/NotoSansJP-Regular.ttf')
      if (!response.ok) {
        throw new Error(`Font fetch failed: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      let binary = ''
      const len = uint8Array.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i])
      }

      const fontBase64 = btoa(binary)
      console.log(`✅ Font loaded: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`)

      // PDF作成
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // 日本語フォント追加
      doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64)
      doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal')
      doc.setFont('NotoSansJP', 'normal')

      const margin = 15
      let yPos = margin + 10

      // タイトル
      doc.setFontSize(20)
      doc.text('日本語フォントテスト', margin, yPos)
      yPos += 15

      // テスト用テキスト
      doc.setFontSize(12)
      doc.text('【漢字テスト】', margin, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text('顧客名: テスト顧客様', margin + 5, yPos)
      yPos += 6
      doc.text('物件住所: 東京都渋谷区渋谷1-2-3', margin + 5, yPos)
      yPos += 6
      doc.text('営業担当者: 山田太郎', margin + 5, yPos)
      yPos += 6
      doc.text('会社名: 株式会社テスト塗装', margin + 5, yPos)
      yPos += 12

      doc.setFontSize(12)
      doc.text('【日塗工番号テスト】', margin, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text('壁: 日塗工番号 07-40X (赤)', margin + 5, yPos)
      yPos += 6
      doc.text('屋根: 日塗工番号 N90 (黒)', margin + 5, yPos)
      yPos += 6
      doc.text('ドア: 変更なし', margin + 5, yPos)
      yPos += 12

      doc.setFontSize(12)
      doc.text('【ひらがな・カタカナテスト】', margin, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text('これはひらがなのテストです。', margin + 5, yPos)
      yPos += 6
      doc.text('コレハカタカナノテストデス。', margin + 5, yPos)
      yPos += 12

      doc.setFontSize(12)
      doc.text('【特殊文字テスト】', margin, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text('記号: ！？、。「」【】（）・', margin + 5, yPos)
      yPos += 6
      doc.text('数字: 0123456789', margin + 5, yPos)

      // PDF保存
      doc.save('font-test.pdf')

      setStatus('✅ PDF出力が成功しました！ダウンロードフォルダを確認してください。')
      console.log('✅ PDF exported successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`❌ エラー: ${errorMessage}`)
      console.error('❌ PDF export failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">PDF日本語フォントテスト</h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            このページは、PDF出力機能の日本語フォント対応をテストするための専用ページです。
          </p>
          <p className="text-gray-600">
            ボタンをクリックすると、テストデータを使ってPDFが生成されます。
          </p>
        </div>

        <button
          onClick={handleTestPdf}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          PDF出力をテスト
        </button>

        {status && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{status}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-bold mb-2">テスト内容:</h2>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>日本語フォント（Noto Sans JP）の動的ロード</li>
            <li>漢字、ひらがな、カタカナの表示確認</li>
            <li>日塗工番号などの特殊文字の表示確認</li>
            <li>コンソールエラー（unicode cmap, font lookup）がないことの確認</li>
          </ul>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>ブラウザのコンソールを開いて、エラーメッセージを確認してください。</p>
        </div>
      </div>
    </div>
  )
}
