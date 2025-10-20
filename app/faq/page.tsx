'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Home } from 'lucide-react'
import { LegalFooter } from '@/components/legal-footer'

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

const faqData: FAQItem[] = [
  {
    question: 'Paintlyとは何ですか？',
    answer: 'Paintlyは、AI技術を活用した塗装シミュレーションツールです。建物の写真をアップロードするだけで、140色以上の高精度な塗装後のイメージを瞬時に生成できます。塗装業者やリフォーム業者の営業活動を革新し、お客様への提案品質と成約率を大幅に向上させます。'
  },
  {
    question: 'どのように使うのですか？',
    answer: (
      <>
        <p className="mb-3">Paintlyの使い方は非常にシンプルです：</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>アカウントを作成してログイン</li>
          <li>顧客ページを作成</li>
          <li>建物の写真をアップロード</li>
          <li>壁、屋根、ドアの色を選択</li>
          <li>「生成」ボタンをクリック</li>
          <li>数秒で塗装後のイメージが完成</li>
          <li>ビフォーアフター比較やPDFダウンロードが可能</li>
        </ol>
      </>
    )
  },
  {
    question: '料金はいくらですか？',
    answer: (
      <>
        <p className="mb-3">Paintlyは生成回数に応じた複数の料金プランをご用意しています：</p>
        <ul className="space-y-2 ml-4">
          <li><strong>無料プラン:</strong> 月3回生成・顧客ページ3件まで（お試し用）</li>
          <li><strong>ライトプラン:</strong> 月額2,980円 - 月30回生成・顧客ページ無制限</li>
          <li><strong>スタンダードプラン:</strong> 月額5,980円 - 月100回生成・顧客ページ無制限</li>
          <li><strong>プロプラン:</strong> 月額9,980円 - 月300回生成・顧客ページ無制限</li>
          <li><strong>ビジネスプラン:</strong> 月額19,800円 - 月1,000回生成・顧客ページ無制限</li>
        </ul>
        <p className="mt-3">
          <Link href="/pricing" className="text-orange-600 hover:underline font-semibold">
            詳しい料金プランはこちら
          </Link>
        </p>
      </>
    )
  },
  {
    question: '無料で試すことはできますか？',
    answer: 'はい、無料プランをご用意しています。アカウント登録後、3回まで無料で画像生成をお試しいただけます。クレジットカード登録不要で、すぐにご利用開始できます。'
  },
  {
    question: '画像生成は何回まで可能ですか？',
    answer: '生成回数はご契約のプランによって異なります。無料プランは月3回、ライトプランは月30回、スタンダードプランは月100回、プロプランは月300回、ビジネスプランは月1,000回までご利用いただけます。生成回数は毎月1日にリセットされます。'
  },
  {
    question: 'どのような建物に対応していますか？',
    answer: '一戸建て住宅、マンション、アパート、店舗、事務所など、あらゆる建物に対応しています。外壁塗装、屋根塗装、ドアの色変更など、さまざまなシミュレーションが可能です。正面からの写真であれば、建物の種類や大きさを問わずご利用いただけます。'
  },
  {
    question: 'スマートフォンで使えますか？',
    answer: 'はい、Paintlyはスマートフォン・タブレット・PCのすべてに対応しています。特に営業現場でのご利用を想定し、スマートフォンでの操作性を最優先に設計しています。現地調査時にその場で写真を撮影し、即座にシミュレーションを生成してお客様に提示できます。'
  },
  {
    question: '生成した画像はダウンロードできますか？',
    answer: 'はい、生成した画像は個別にダウンロードできます。また、複数の候補をまとめてPDF形式でダウンロードすることも可能です。PDFには元画像と生成画像の比較、選択した色情報などが含まれ、そのまま提案資料としてお客様にお渡しいただけます。'
  },
  {
    question: '商用利用は可能ですか？',
    answer: 'はい、Paintlyで生成した画像は商用利用が可能です。お客様への提案資料、見積書への添付、ウェブサイトやSNSでの事例紹介など、営業活動や広告宣伝に自由にご利用いただけます。ただし、生成画像そのものを販売する行為は禁止されています。'
  },
  {
    question: '色の種類はどのくらいありますか？',
    answer: 'Paintlyは140色以上の高精度な塗装色をご用意しています。日本塗料工業会（日塗工）の標準色見本帳に基づいた実際の塗料色を使用しており、シミュレーション結果と実際の仕上がりの差が最小限になるように設計されています。'
  },
  {
    question: 'シミュレーションの精度はどのくらいですか？',
    answer: 'Paintlyは最新のAI技術（Gemini 2.5 Flash）を使用しており、建物の形状や光の当たり方を考慮した高精度なシミュレーションを実現しています。ただし、実際の塗装は照明条件や天候によって見え方が変わるため、シミュレーションはあくまで参考としてご利用ください。'
  },
  {
    question: 'データは安全に管理されていますか？',
    answer: 'はい、Paintlyはお客様のデータを厳重に管理しています。すべての通信はSSL/TLS暗号化により保護され、画像データはセキュアなクラウドストレージに保存されます。また、お客様のデータを第三者に提供することは一切ありません。詳しくはプライバシーポリシーをご確認ください。'
  },
  {
    question: 'サポートはありますか？',
    answer: 'はい、すべてのプランでメールサポートをご利用いただけます。操作方法に関するご質問や技術的な問題など、お気軽にお問い合わせください。また、アプリ内にはチュートリアルガイドも用意しており、初めての方でも安心してご利用いただけます。'
  },
  {
    question: '解約はいつでもできますか？',
    answer: 'はい、有料プランはいつでも解約が可能です。解約手続きは設定ページから簡単に行えます。解約した場合、次回の更新日までは引き続きサービスをご利用いただけます。日割り返金は行っておりませんので、ご了承ください。'
  },
]

function FAQAccordion({ item, index, isOpen, toggleOpen }: {
  item: FAQItem
  index: number
  isOpen: boolean
  toggleOpen: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors">
      <button
        onClick={toggleOpen}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="font-semibold text-gray-900 pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-orange-600 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        id={`faq-answer-${index}`}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[1000px]' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed">
          {typeof item.answer === 'string' ? (
            <p>{item.answer}</p>
          ) : (
            item.answer
          )}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // FAQ Schema Markup for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof item.answer === 'string'
          ? item.answer
          : item.question.includes('料金')
            ? 'Paintlyは複数の料金プランをご用意しています。無料プラン（3回）、ライトプラン（月額2,980円・月30回）、スタンダードプラン（月額5,980円・月100回）、プロプラン（月額9,980円・月300回）、ビジネスプラン（月額19,800円・月1,000回）があります。'
            : item.question.includes('使い方')
            ? 'アカウント作成→顧客ページ作成→写真アップロード→色選択→生成の順で簡単にご利用いただけます。'
            : '詳しくは公式サイトをご覧ください。'
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              <Home className="h-5 w-5" />
              ホームに戻る
            </Link>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              よくある質問
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Paintlyに関するよくあるご質問とその回答をまとめました。<br />
              解決しない場合は、お気軽にお問い合わせください。
            </p>
          </div>

          {/* FAQ アコーディオン */}
          <div className="space-y-3">
            {faqData.map((item, index) => (
              <FAQAccordion
                key={index}
                item={item}
                index={index}
                isOpen={openIndex === index}
                toggleOpen={() => toggleOpen(index)}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              さらに詳しく知りたい方へ
            </h2>
            <p className="text-lg mb-6 opacity-90">
              無料プランで実際にPaintlyをお試しいただけます
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              無料で始める
            </Link>
          </div>
        </main>

        {/* フッター */}
        <LegalFooter variant="default" className="mt-16" />
      </div>
    </>
  )
}
