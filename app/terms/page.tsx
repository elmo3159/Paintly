import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | Paintly',
  description: 'Paintlyサービス利用規約',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">利用規約</h1>
          <p className="text-gray-600">最終更新日: 2025年10月15日</p>
        </div>

        {/* 利用規約本文 */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* 第1条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第1条（適用）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 本規約は、Paintly（以下「当サービス」といいます）の利用に関する条件を、当サービスを利用するお客様（以下「利用者」といいます）と当サービス運営者（以下「当社」といいます）との間で定めるものです。
              </p>
              <p>
                2. 利用者は、本規約に同意した上で、当サービスを利用するものとします。
              </p>
              <p>
                3. 当サービスの利用を開始した時点で、利用者は本規約の全ての内容に同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第2条（定義）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>本規約において使用する用語の定義は、以下のとおりとします。</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>「当サービス」</strong>：当社が提供するPaintly（AI塗装シミュレーションツール）およびこれに付随するサービス
                </li>
                <li>
                  <strong>「利用者」</strong>：当サービスに登録し、またはこれを利用する全ての個人および法人
                </li>
                <li>
                  <strong>「アカウント」</strong>：当サービスの利用に必要な利用者固有の識別情報
                </li>
                <li>
                  <strong>「コンテンツ」</strong>：利用者が当サービスを通じてアップロード、作成、共有する全ての情報（画像、テキスト等）
                </li>
              </ul>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第3条（アカウント登録）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 利用者は、当サービスの利用にあたり、真実かつ正確な情報を提供してアカウントを登録するものとします。
              </p>
              <p>
                2. 利用者は、登録した情報に変更が生じた場合、速やかに当該情報を更新するものとします。
              </p>
              <p>
                3. 利用者は、自己の責任においてアカウント情報（メールアドレス、パスワード等）を管理するものとし、これを第三者に利用させ、または譲渡、貸与、名義変更、売買等をしてはならないものとします。
              </p>
              <p>
                4. アカウント情報の管理不十分、使用上の過誤、第三者の使用等による損害の責任は利用者が負うものとし、当社は一切の責任を負いません。
              </p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第4条（料金および支払い）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当サービスの利用料金は、当サービスのウェブサイトに掲載する料金表に定めるとおりとします。
              </p>
              <p>
                2. 利用者は、選択したプランに応じた料金を、当社が指定する方法により支払うものとします。
              </p>
              <p>
                3. 有料プランは月額制のサブスクリプション（定額課金）方式とし、毎月自動的に課金されます。
              </p>
              <p>
                4. 支払い方法は、クレジットカード、デビットカード、その他当社が指定する決済方法とします。
              </p>
              <p>
                5. 利用者が支払期日までに料金の支払いを行わない場合、当社は事前の通知なく当該利用者のアカウントを停止または削除することができるものとします。
              </p>
              <p>
                6. 一度お支払いいただいた料金は、理由の如何を問わず返金いたしません。ただし、法令により返金が義務付けられる場合、または当社が特に認める場合はこの限りではありません。
              </p>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第5条（プランの変更・解約）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 利用者は、当サービス内の設定画面からいつでもプランの変更または解約を行うことができます。
              </p>
              <p>
                2. プランの変更は、変更手続き完了後の次回請求日から適用されます。
              </p>
              <p>
                3. 解約手続きは、次回請求日の前日までに行う必要があります。請求日当日以降の解約申請は、次回請求分からの適用となります。
              </p>
              <p>
                4. 解約後も、既に支払い済みの期間内は当サービスを利用できます。
              </p>
              <p>
                5. 解約に伴う返金は、前条第6項の定めに従います。
              </p>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第6条（禁止事項）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>利用者は、当サービスの利用にあたり、以下の行為を行ってはならないものとします。</p>
              <ul className="list-decimal list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、他の利用者、または第三者の権利（知的財産権、プライバシー権等）を侵害する行為</li>
                <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>不正な目的を持って当サービスを利用する行為</li>
                <li>反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>他の利用者または第三者になりすます行為</li>
                <li>当サービスを商業目的で利用する行為（ただし、当社が別途認める場合を除く）</li>
                <li>当サービスで生成された画像を、利用者の顧客以外の第三者に対して無断で配布・販売する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第7条（知的財産権）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当サービスおよび当サービスに関連する一切のコンテンツ（プログラム、デザイン、ロゴ、文章等）に関する知的財産権は、当社または当社にライセンスを許諾している者に帰属します。
              </p>
              <p>
                2. 利用者が当サービスを通じて生成した画像の著作権は利用者に帰属しますが、利用者は当社に対し、当該画像を当サービスの宣伝・広告目的で使用する非独占的な権利を無償で許諾するものとします。
              </p>
              <p>
                3. 利用者は、当社の事前の書面による承諾なく、当サービスおよび当サービスに関連するコンテンツを、複製、転載、改変、公衆送信等してはならないものとします。
              </p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第8条（免責事項）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、当サービスの内容、品質、正確性、完全性、有効性、特定の目的への適合性について、いかなる保証もいたしません。
              </p>
              <p>
                2. 当サービスで生成される画像は、AIによる自動生成であり、その品質や正確性について当社は保証いたしません。
              </p>
              <p>
                3. 当社は、当サービスの提供の遅延、中断、終了、当サービスを通じて提供される情報等の消失もしくは毀損、その他当サービスに関連して発生した利用者または第三者の損害について、一切の責任を負いません。ただし、当社に故意または重過失がある場合はこの限りではありません。
              </p>
              <p>
                4. 当社は、利用者が当サービスを利用することにより第三者との間で生じた紛争等について、一切の責任を負いません。
              </p>
              <p>
                5. 当社の責任は、当社に故意または重過失がある場合を除き、利用者が当社に支払った直近1ヶ月分の利用料金を上限とします。
              </p>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第9条（サービス内容の変更・中断・終了）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、利用者への事前の通知なく、当サービスの内容を変更し、または当サービスの提供を中断もしくは終了することができるものとします。ただし、サービスの終了については、可能な限り事前に利用者に通知するよう努めるものとします。
              </p>
              <p>
                2. 当社は、以下のいずれかに該当する場合、利用者への事前の通知なく、当サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サービスに係るコンピューターシステムの点検または保守作業を緊急に行う場合</li>
                <li>コンピューター、通信回線等が事故により停止した場合</li>
                <li>地震、落雷、火災、風水害、停電、天災地変などの不可抗力により当サービスの運営ができなくなった場合</li>
                <li>その他、当社が停止または中断を必要と判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第10条（利用制限およびアカウントの削除）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、利用者が以下のいずれかに該当する場合、事前の通知なく、当該利用者に対して、当サービスの全部もしくは一部の利用を制限し、またはアカウントを削除することができるものとします。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>料金等の支払債務の不履行があった場合</li>
                <li>当社からの連絡に対し、相当の期間内に応答がない場合</li>
                <li>その他、当社が当サービスの利用を適当でないと判断した場合</li>
              </ul>
              <p>
                2. 前項各号のいずれかの事由に該当した場合、利用者は、当社に対して負っている債務の一切について当然に期限の利益を失い、直ちに当社に対して全ての債務の支払いを行わなければなりません。
              </p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第11条（本規約の変更）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 当社は、民法第548条の4（定型約款の変更）に基づき、以下の場合に本規約を変更することができます。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本規約の変更が、利用者の一般の利益に適合するとき</li>
                <li>
                  本規約の変更が、契約をした目的に反せず、かつ、変更の必要性、変更後の内容の相当性、変更の内容その他の変更に係る事情に照らして合理的なものであるとき
                </li>
              </ul>
              <p>
                2. 当社は、前項による本規約の変更にあたり、変更後の本規約の効力発生日の2週間前までに、本規約を変更する旨および変更後の本規約の内容とその効力発生日を当サービス上に掲示し、または利用者に電子メール等で通知します。
              </p>
              <p>
                3. 変更後の本規約の効力発生日以降に利用者が当サービスを利用した場合、利用者は変更後の本規約に同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 第12条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第12条（個人情報の取扱い）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                当社は、利用者の個人情報を、別途定めるプライバシーポリシーに従って適切に取り扱うものとします。
              </p>
            </div>
          </section>

          {/* 第13条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第13条（通知または連絡）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 利用者と当社との間の通知または連絡は、当社の定める方法（電子メール、当サービス内の通知機能等）によって行うものとします。
              </p>
              <p>
                2. 当社が登録事項に含まれるメールアドレスその他の連絡先に通知または連絡を行った場合、利用者は当該通知または連絡を受領したものとみなします。
              </p>
            </div>
          </section>

          {/* 第14条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第14条（権利義務の譲渡の禁止）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                利用者は、当社の書面による事前の承諾なく、本規約に基づく権利もしくは義務、または契約上の地位について、第三者に対し、譲渡、移転、担保設定、その他の処分をすることはできません。
              </p>
            </div>
          </section>

          {/* 第15条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第15条（分離可能性）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                本規約のいずれかの条項またはその一部が、法令等により無効または執行不能と判断された場合であっても、本規約の残りの規定および一部が無効または執行不能と判断された規定の残りの部分は、継続して完全に効力を有するものとします。
              </p>
            </div>
          </section>

          {/* 第16条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              第16条（準拠法および管轄裁判所）
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                1. 本規約の準拠法は日本法とします。
              </p>
              <p>
                2. 本規約または当サービスに関連して利用者と当社との間で生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
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
