import { Metadata } from 'next'
import Link from 'next/link'
import { Home, FileText, DollarSign, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | Paintly',
  description: 'Paintly 特定商取引法に基づく表記',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ナビゲーションリンク */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            ホームに戻る
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            料金プラン
          </Link>
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Shield className="h-4 w-4" />
            プライバシーポリシー
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">特定商取引法に基づく表記</h1>
          <p className="text-gray-600">最終更新日: 2025年10月15日</p>
        </div>

        {/* 表記本文 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* 事業者情報 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                1
              </span>
              事業者の名称
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="font-medium">村上 ダニエル</p>
              <p className="text-sm text-gray-600 mt-1">
                ※個人事業主として運営しています
              </p>
            </div>
          </section>

          {/* 運営責任者 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                2
              </span>
              運営責任者
            </h2>
            <div className="ml-11 text-gray-700">
              <p>運営責任者氏名はお問い合わせにより開示いたします</p>
              <p className="text-sm text-gray-600 mt-1">
                ※プライバシー保護のため、請求があった場合に遅滞なく開示いたします
              </p>
            </div>
          </section>

          {/* 所在地 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                3
              </span>
              所在地
            </h2>
            <div className="ml-11 text-gray-700">
              <p>所在地はお問い合わせにより開示いたします</p>
              <p className="text-sm text-gray-600 mt-1">
                ※プライバシー保護のため、請求があった場合に遅滞なく開示いたします
              </p>
            </div>
          </section>

          {/* 連絡先 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                4
              </span>
              お問い合わせ
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="font-medium">メールアドレス: sanri.3159@gmail.com</p>
              <p className="text-sm text-gray-600 mt-2">
                ※お問い合わせへの回答には、1～3営業日程度お時間をいただく場合がございます
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ※電話番号はお問い合わせにより開示いたします
              </p>
            </div>
          </section>

          {/* 販売価格 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                5
              </span>
              販売価格
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="mb-4">サービス内の料金プランページに表示される金額（消費税込み）</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">無料プラン</span>
                  <span className="text-lg font-bold text-green-600">無料</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">ライトプラン</span>
                  <span className="text-lg font-bold">月額 2,980円（税込）</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">スタンダードプラン</span>
                  <span className="text-lg font-bold">月額 5,980円（税込）</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">プロプラン</span>
                  <span className="text-lg font-bold">月額 9,980円（税込）</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">ビジネスプラン</span>
                  <span className="text-lg font-bold">月額 19,800円（税込）</span>
                </div>
              </div>
            </div>
          </section>

          {/* 支払方法 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                6
              </span>
              支払方法
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="mb-3">以下の支払方法に対応しています（Stripe決済を利用）：</p>
              <ul className="list-disc list-inside space-y-2">
                <li>クレジットカード（Visa、Mastercard、American Express、JCB等）</li>
                <li>デビットカード</li>
                <li>その他Stripeが対応する決済方法</li>
              </ul>
            </div>
          </section>

          {/* 支払時期 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                7
              </span>
              支払時期
            </h2>
            <div className="ml-11 text-gray-700">
              <ul className="space-y-2">
                <li>• <strong>初回</strong>: プラン購入時に即時決済</li>
                <li>• <strong>継続課金</strong>: 毎月の課金日に自動決済</li>
                <li>• 課金日はプラン購入日と同じ日（例: 1月15日購入の場合、毎月15日に課金）</li>
              </ul>
            </div>
          </section>

          {/* サービス提供時期 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                8
              </span>
              サービスの提供時期
            </h2>
            <div className="ml-11 text-gray-700">
              <p>決済完了後、即時サービスをご利用いただけます</p>
            </div>
          </section>

          {/* 返品・キャンセル */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                9
              </span>
              返品・キャンセルについて
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="mb-3">
                <strong>デジタルコンテンツの性質上、以下の通りとなります：</strong>
              </p>
              <ul className="space-y-2">
                <li>• サービスの特性上、返品・返金には応じかねます</li>
                <li>• 解約はいつでも可能です（サービス内の設定画面から実施）</li>
                <li>• 解約後も、既に支払い済みの期間内はサービスをご利用いただけます</li>
                <li>• 次回課金日前日までに解約手続きを完了することで、次回以降の課金を停止できます</li>
              </ul>
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ 重要</strong>: 一度お支払いいただいた料金は、原則として返金いたしません。ただし、当社の責めに帰すべき事由による場合、または法令により返金が義務付けられる場合はこの限りではありません。
                </p>
              </div>
            </div>
          </section>

          {/* 解約について */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                10
              </span>
              解約方法（サブスクリプションの中途解約）
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="mb-3">以下の手順で解約できます：</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>サービス内のアカウント設定ページにアクセス</li>
                <li>「プラン管理」または「サブスクリプション設定」を選択</li>
                <li>「プランをキャンセル」ボタンをクリック</li>
                <li>解約確認画面で「解約する」を選択</li>
              </ol>
              <p className="mt-3 text-sm text-gray-600">
                ※解約手続きは、次回課金日の前日までに完了してください
              </p>
              <p className="text-sm text-gray-600">
                ※解約後も、既に支払い済みの期間内は引き続きサービスをご利用いただけます
              </p>
            </div>
          </section>

          {/* 動作環境 */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                11
              </span>
              動作環境
            </h2>
            <div className="ml-11 text-gray-700">
              <p className="mb-3">以下の環境でのご利用を推奨します：</p>
              <ul className="space-y-2">
                <li>• <strong>ブラウザ</strong>: Chrome、Safari、Edge、Firefox（最新版）</li>
                <li>• <strong>デバイス</strong>: PC、タブレット、スマートフォン</li>
                <li>• <strong>インターネット接続</strong>: 安定したインターネット環境が必要です</li>
              </ul>
            </div>
          </section>

          {/* 注意事項 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                12
              </span>
              その他の注意事項
            </h2>
            <div className="ml-11 text-gray-700">
              <ul className="space-y-3">
                <li>
                  • サービスの性質上、生成される画像の品質や正確性について保証はいたしません
                </li>
                <li>
                  • 各プランの画像生成回数は、毎月リセットされます（繰り越しはできません）
                </li>
                <li>
                  • メンテナンス等により、一時的にサービスが利用できない場合がございます
                </li>
                <li>
                  • 利用規約に違反した場合、予告なくアカウントを停止する場合がございます
                </li>
                <li>
                  • 本表記の内容は予告なく変更する場合がございます
                </li>
              </ul>
            </div>
          </section>

          {/* フッター */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>制定日: 2025年10月15日</p>
            <p className="mt-2">村上 ダニエル</p>
            <p className="mt-4 text-sm">
              ご不明な点がございましたら、上記お問い合わせ先までご連絡ください
            </p>
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
