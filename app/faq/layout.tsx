import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問（FAQ）',
  description: 'Paintlyに関するよくあるご質問とその回答。料金プラン、使い方、生成回数、対応デバイス、商用利用、サポート体制など、お客様の疑問にお答えします。',
  keywords: 'Paintly FAQ,よくある質問,料金プラン,使い方,塗装シミュレーション,AI塗装,外壁塗装シミュレーション,屋根塗装,商用利用,サポート,営業支援',
  openGraph: {
    title: 'よくある質問（FAQ） | Paintly',
    description: 'Paintlyに関するよくあるご質問とその回答をまとめました。料金プラン、使い方、対応デバイスなど詳しく解説。',
    url: 'https://paintly.pro/faq',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Paintly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'よくある質問（FAQ） | Paintly',
    description: 'Paintlyに関するよくあるご質問とその回答をまとめました。',
  },
  alternates: {
    canonical: 'https://paintly.pro/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
