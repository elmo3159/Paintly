'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'

export function FaqSection() {
  const [isFaqExpanded, setIsFaqExpanded] = useState(false)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            よくある質問
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Paintlyについてお客様からよく寄せられる質問にお答えします
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 mb-12">
          {/* FAQ 1 */}
          <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-orange-700">Q.</span>
              <span>どのような建物に対応していますか？</span>
            </h3>
            <p className="text-gray-700 ml-8 leading-relaxed">
              一戸建て住宅、マンション、アパート、店舗、事務所など、<strong className="font-semibold">あらゆる建物に対応</strong>しています。<br />
              外壁塗装、屋根塗装、ドアの色変更など、さまざまなシミュレーションが可能です。<br />
              正面からの写真であれば、建物の種類や大きさを問わずご利用いただけます。
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-orange-700">Q.</span>
              <span>スマートフォンで使えますか？</span>
            </h3>
            <p className="text-gray-700 ml-8 leading-relaxed">
              はい、Paintlyは<strong className="font-semibold">スマートフォン・タブレット・PC</strong>のすべてに対応しています。<br />
              特に<strong className="font-semibold">営業現場でのご利用</strong>を想定し、スマートフォンでの操作性を最優先に設計しています。<br />
              現地調査時にその場で写真を撮影し、即座にシミュレーションを生成してお客様に提示できます。
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-orange-700">Q.</span>
              <span>商用利用は可能ですか？</span>
            </h3>
            <p className="text-gray-700 ml-8 leading-relaxed">
              はい、Paintlyで生成した画像は<strong className="font-semibold text-green-700">商用利用が可能</strong>です。<br />
              お客様への提案資料、見積書への添付、ウェブサイトやSNSでの事例紹介など、営業活動や広告宣伝に自由にご利用いただけます。<br />
              ただし、生成画像そのものを販売する行為は禁止されています。
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-orange-700">Q.</span>
              <span>料金プランの違いは何ですか？</span>
            </h3>
            <p className="text-gray-700 ml-8 leading-relaxed">
              プランは<strong className="font-semibold">月間の画像生成回数</strong>で分かれています。<br />
              無料プラン（3回）、ライトプラン（30回/月）、スタンダードプラン（100回/月）、プロプラン（300回/月）、ビジネスプラン（1,000回/月）をご用意しています。<br />
              すべてのプランで機能制限はなく、顧客管理も無制限にご利用いただけます。
            </p>
          </div>

          {/* FAQ 5 */}
          <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-orange-700">Q.</span>
              <span>無料プランで何回使えますか？</span>
            </h3>
            <p className="text-gray-700 ml-8 leading-relaxed">
              無料プランでは<strong className="font-semibold text-orange-700">アカウント作成後3回まで</strong>画像生成が可能です。<br />
              クレジットカード登録は不要で、すぐにお試しいただけます。<br />
              3回使い切った後も、有料プランにアップグレードすることで継続してご利用いただけます。
            </p>
          </div>

          {/* FAQ 6-15: 折りたたみ可能セクション */}
          <div className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${
            isFaqExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {/* FAQ 6 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>クレジットカードは必要ですか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                <strong className="font-semibold">無料プランのご利用にはクレジットカードは不要</strong>です。<br />
                有料プランをご利用の場合は、Stripeによる決済となり、クレジットカードまたはデビットカードが必要です。<br />
                安全な決済環境を提供しており、カード情報は厳重に保護されます。
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>解約はいつでもできますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                はい、<strong className="font-semibold text-green-700">いつでも解約可能</strong>です。<br />
                解約手続きは設定ページから簡単に行えます。次回請求日の前に解約すれば、それ以降の課金は発生しません。<br />
                解約後も、当月分の生成回数は引き続きご利用いただけます。
              </p>
            </div>

            {/* FAQ 8 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>生成された画像の著作権はどうなりますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Paintlyで生成された画像の<strong className="font-semibold text-green-700">著作権は利用者に帰属</strong>します。<br />
                営業資料、見積書、SNS投稿など、自由にご利用いただけます。<br />
                ただし、生成画像そのものを商品として販売する行為は利用規約で禁止されています。
              </p>
            </div>

            {/* FAQ 9 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>オフラインでも使えますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Paintlyは<strong className="font-semibold">PWA（Progressive Web App）</strong>技術を採用しており、一部の機能はオフラインでも動作します。<br />
                ただし、AI画像生成には<strong className="font-semibold">インターネット接続が必要</strong>です。<br />
                ネット環境が不安定な現場でも、キャッシュ機能により快適にご利用いただけます。
              </p>
            </div>

            {/* FAQ 10 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>どのブラウザに対応していますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                <strong className="font-semibold">Chrome、Safari、Edge、Firefox</strong>の最新版に対応しています。<br />
                スマートフォンでは、iOS（Safari）およびAndroid（Chrome）での動作を確認しています。<br />
                最高のパフォーマンスを得るため、常に最新バージョンのブラウザをご使用ください。
              </p>
            </div>

            {/* FAQ 11 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>画像生成にどれくらい時間がかかりますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                最新のAI技術により、<strong className="font-semibold text-orange-700">通常5〜10秒程度</strong>で高精度なシミュレーション画像を生成します。<br />
                ネットワーク環境や画像のサイズによって若干変動する場合がありますが、お客様をお待たせすることなく、その場で提示できるスピードです。
              </p>
            </div>

            {/* FAQ 12 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>他の塗装シミュレーションツールとの違いは？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Paintlyは<strong className="font-semibold text-purple-600">最新のAI技術（Gemini）</strong>を使用し、建物の形状や光の当たり方まで考慮したリアルな画像を生成します。<br />
                スマートフォン1台で完結し、<strong className="font-semibold">営業現場でのその場提案</strong>に最適化されています。<br />
                顧客ごとの履歴管理、ビフォーアフター比較、QRコード共有など、営業活動に必要な機能を網羅しています。
              </p>
            </div>

            {/* FAQ 13 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>導入までどれくらいかかりますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                <strong className="font-semibold text-green-700">今すぐ始められます。</strong><br />
                メールアドレスで無料アカウントを作成すれば、特別な設定や研修なしで、すぐに画像生成をお試しいただけます。<br />
                直感的な操作画面で、初めての方でも迷わずご利用いただけます。
              </p>
            </div>

            {/* FAQ 14 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>サポート体制はどうなっていますか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                メールでのサポートを提供しています（<a href="mailto:sanri.3159@gmail.com" className="text-orange-700 hover:underline">sanri.3159@gmail.com</a>）。<br />
                よくある質問やチュートリアルも充実しており、多くの疑問はサイト内で解決できます。<br />
                有料プランご利用の方には<strong className="font-semibold">優先的に対応</strong>させていただきます。
              </p>
            </div>

            {/* FAQ 15 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-orange-700">Q.</span>
                <span>データのセキュリティは大丈夫ですか？</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Paintlyは<strong className="font-semibold text-blue-600">業界標準のセキュリティ対策</strong>を実施しています。<br />
                データはSupabase（PostgreSQL）で暗号化保存され、画像はCloudflare R2で安全に管理されます。<br />
                決済情報はStripeによって処理され、当社がクレジットカード情報を直接保持することはありません。
              </p>
            </div>
          </div>

          {/* FAQ展開/折りたたみボタン */}
          <div className="text-center mt-8">
            <button
              onClick={() => setIsFaqExpanded(!isFaqExpanded)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {isFaqExpanded ? (
                <>
                  <ChevronDown className="h-5 w-5 rotate-180 transition-transform" />
                  <span>FAQを折りたたむ</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5 transition-transform" />
                  <span>さらに10件のFAQを見る</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/faq" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-700 font-semibold text-lg">
            すべてのFAQを見る
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
