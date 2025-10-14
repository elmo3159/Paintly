import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '共有画像 - Paintly',
  description: 'Paintlyで作成された塗装シミュレーション画像',
  robots: {
    index: false, // 共有ページは検索エンジンにインデックスさせない
    follow: false,
  },
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* 共有ページはスクロール可能にする */}
      <style jsx global>{`
        html, body {
          overflow: auto !important;
          height: auto !important;
        }
      `}</style>
      {children}
    </>
  )
}
