import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Paintly',
  description: 'Paintlyプライバシーポリシー - 個人情報保護方針',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
          <p className="text-gray-600">最終更新日: 2025年10月15日</p>
        </div>

        {/* プライバシーポリシー本文 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* 前文 */}
          <section>
            <div className="space-y-3 text-gray-700">
              <p>
                Paintly運営者（以下「当社」といいます）は、当社が提供するPaintly（以下「当サービス」といいます）における利用者の個人情報の取扱いについて、個人情報の保護に関する法律（以下「個人情報保護法」といいます）をはじめとする個人情報保護に関する法令およびガイドラインを遵守し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
              </p>
            </div>
          </section>

          {/* 第1条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第1条（個人情報の定義）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                本ポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定める「個人情報」、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）、または個人識別符号が含まれるものを指します。
              </p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第2条（取得する個人情報の項目）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>当社は、利用者から以下の個人情報を取得します。</p>

              <h3 className="font-bold text-lg mt-4 mb-2">1. アカウント登録時</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>氏名（任意）</li>
                <li>会社名（任意）</li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">2. サービス利用時</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>アップロードされた建物の画像</li>
                <li>生成された塗装シミュレーション画像</li>
                <li>顧客ページのタイトルおよび管理情報</li>
                <li>画像生成の履歴情報</li>
                <li>利用プラン情報</li>
                <li>サービス利用状況（画像生成回数、ログイン日時等）</li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">3. 決済情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>クレジットカード情報（Stripeにより安全に処理され、当社は保存しません）</li>
                <li>決済履歴</li>
                <li>プラン契約情報</li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">4. 自動的に取得される情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IPアドレス</li>
                <li>Cookie情報</li>
                <li>ブラウザの種類およびバージョン</li>
                <li>デバイス情報（OS、画面サイズ等）</li>
                <li>アクセスログ</li>
                <li>リファラー情報</li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第3条（個人情報の利用目的）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>当社は、取得した個人情報を以下の目的で利用します。</p>
              <ul className="list-decimal list-inside space-y-2 ml-4">
                <li>当サービスの提供、維持、保護および改善のため</li>
                <li>アカウントの作成、認証、管理のため</li>
                <li>画像生成機能の提供およびその品質向上のため</li>
                <li>利用者への課金および決済処理のため</li>
                <li>利用者からのお問い合わせへの対応のため</li>
                <li>利用規約違反行為への対応のため</li>
                <li>当サービスに関する規約、ポリシー等の変更等の通知のため</li>
                <li>当サービスに関するメンテナンス、重要なお知らせ等の配信のため</li>
                <li>当サービスの新機能、キャンペーン等の案内配信のため（オプトアウト可能）</li>
                <li>統計データの作成および分析のため（個人を特定できない形式に加工します）</li>
                <li>不正利用の検知および防止のため</li>
                <li>法令に基づく対応のため</li>
              </ul>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第4条（第三者への提供）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、以下の場合を除き、利用者の個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>利用者の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>

              <p className="mt-4">
                2. ただし、以下の場合は上記に定める第三者への提供には該当しないものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
                <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
                <li>個人情報保護法の定めに基づき共同利用する場合</li>
              </ul>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第5条（外部サービスの利用）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                当社は、当サービスの提供にあたり、以下の外部サービスを利用しており、これらのサービス提供者に個人情報の一部を委託しています。各サービスは、それぞれのプライバシーポリシーに基づいて個人情報を取り扱います。
              </p>

              <h3 className="font-bold text-lg mt-4 mb-2">1. Supabase（データベース・認証）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供者: Supabase, Inc.（米国）</li>
                <li>利用目的: ユーザー認証、データベース管理、ファイルストレージ</li>
                <li>
                  プライバシーポリシー:{' '}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://supabase.com/privacy
                  </a>
                </li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">2. Stripe（決済処理）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供者: Stripe, Inc.（米国）</li>
                <li>利用目的: クレジットカード決済処理、サブスクリプション管理</li>
                <li>
                  プライバシーポリシー:{' '}
                  <a
                    href="https://stripe.com/jp/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://stripe.com/jp/privacy
                  </a>
                </li>
                <li>※クレジットカード番号は当社では保存せず、Stripeが安全に処理します</li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">3. Fal AI（AI画像生成）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供者: Fal.ai</li>
                <li>利用目的: AI塗装シミュレーション画像の生成</li>
                <li>処理されるデータ: アップロードされた建物画像、生成パラメータ</li>
              </ul>

              <h3 className="font-bold text-lg mt-4 mb-2">4. Vercel（ホスティング）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供者: Vercel Inc.（米国）</li>
                <li>利用目的: Webアプリケーションのホスティング、配信</li>
                <li>
                  プライバシーポリシー:{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://vercel.com/legal/privacy-policy
                  </a>
                </li>
              </ul>

              <p className="mt-4">
                上記サービスの一部は米国等の外国に所在しており、個人データが外国のサーバーに保存されます。当社は、これらのサービス提供者が適切なセキュリティ対策を講じていることを確認の上、利用しています。
              </p>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第6条（Cookieおよび類似技術の使用）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、利用者の利便性向上、サービスの改善、アクセス解析等のために、Cookie、ローカルストレージ等の技術を使用します。
              </p>
              <p>
                2. Cookieには以下の種類があります。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>必須Cookie</strong>: サービスの基本機能（ログイン状態の維持等）に必要なもの
                </li>
                <li>
                  <strong>機能Cookie</strong>: 利用者の設定や選択を記憶するもの
                </li>
                <li>
                  <strong>分析Cookie</strong>: サービスの利用状況を分析するもの
                </li>
              </ul>
              <p>
                3. 利用者は、ブラウザの設定によりCookieを無効化することができますが、その場合、当サービスの一部機能が利用できなくなる可能性があります。
              </p>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第7条（個人情報の安全管理措置）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                当社は、個人情報の紛失、破壊、改ざんおよび漏洩等のリスクに対して、個人情報の安全管理のため、以下のような対策を実施しています。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>組織的安全管理措置: 個人情報保護責任者の設置、従業者への教育</li>
                <li>人的安全管理措置: 従業者との秘密保持契約の締結</li>
                <li>物理的安全管理措置: データセンターの物理的セキュリティ対策</li>
                <li>技術的安全管理措置: SSL/TLS暗号化通信、アクセス制御、ファイアウォール設定、定期的なセキュリティ診断</li>
              </ul>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第8条（個人情報の開示、訂正、削除等）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 利用者は、個人情報保護法の定めに基づき、当社に対し、自己の個人情報の開示、訂正、追加、削除、利用停止、消去または第三者提供の停止（以下「開示等」といいます）を請求することができます。
              </p>
              <p>
                2. 開示等の請求は、本ポリシー末尾に記載の問い合わせ先まで、書面、メール等により行うものとします。
              </p>
              <p>
                3. 当社は、請求者が本人であることを確認の上、合理的な期間内に対応いたします。
              </p>
              <p>
                4. 開示請求については、手数料（1件あたり1,000円）を申し受ける場合があります。
              </p>
              <p>
                5. 以下の場合、開示等の請求に応じられない場合があります。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>他の法令に違反することとなる場合</li>
              </ul>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第9条（個人情報の保存期間）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、利用目的の達成に必要な期間、個人情報を保存します。
              </p>
              <p>
                2. アカウント削除後、個人情報は原則として30日以内に削除されます。ただし、法令により保存が義務付けられている情報、または紛争解決のために必要な情報については、必要な期間保存されます。
              </p>
              <p>
                3. 生成された画像データは、各プランの保存期間に従って保存されます。
              </p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第10条（お子様の個人情報）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                当サービスは、18歳未満の方を対象としておりません。18歳未満の方が個人情報を提供した場合、親権者の方は本ポリシー記載の問い合わせ先まで連絡し、当該個人情報の削除を請求することができます。
              </p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第11条（プライバシーポリシーの変更）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、法令の変更、事業内容の変更等に応じて、本ポリシーを変更することがあります。
              </p>
              <p>
                2. 変更後のプライバシーポリシーは、当サービス上に掲載した時点から効力を生じるものとします。ただし、利用者に不利益な重要な変更を行う場合は、事前に電子メール等で通知いたします。
              </p>
            </div>
          </section>

          {/* 第12条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第12条（お問い合わせ窓口）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>本ポリシーに関するお問い合わせ、個人情報の開示等の請求は、以下の窓口までご連絡ください。</p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-bold mb-2">Paintly 個人情報保護窓口</p>
                <p>メールアドレス: sanri.3159@gmail.com</p>
                <p className="mt-2 text-sm text-gray-600">
                  ※お問い合わせへの回答には、数日～1週間程度お時間をいただく場合がございます。
                </p>
              </div>
            </div>
          </section>

          {/* フッター */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>制定日: 2025年10月15日</p>
            <p className="mt-2">村上 ダニエル</p>
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
