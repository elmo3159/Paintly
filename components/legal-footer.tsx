import Link from 'next/link'

interface LegalFooterProps {
  variant?: 'default' | 'minimal'
  className?: string
}

export function LegalFooter({ variant = 'default', className = '' }: LegalFooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className={`py-4 text-center text-sm text-gray-600 ${className}`}>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link
            href="/pricing"
            className="hover:text-blue-600 underline decoration-dotted underline-offset-4 transition-colors"
          >
            料金プラン
          </Link>
          <Link
            href="/faq"
            className="hover:text-blue-600 underline decoration-dotted underline-offset-4 transition-colors"
          >
            よくある質問
          </Link>
          <Link
            href="/terms"
            className="hover:text-blue-600 underline decoration-dotted underline-offset-4 transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="hover:text-blue-600 underline decoration-dotted underline-offset-4 transition-colors"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/legal"
            className="hover:text-blue-600 underline decoration-dotted underline-offset-4 transition-colors"
          >
            特定商取引法表記
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">© 2025 Paintly. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-500">
          このサイトはreCAPTCHAによって保護されており、Googleの
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            プライバシーポリシー
          </a>
          と
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Googleの利用規約
          </a>
          が適用されます。
        </p>
      </footer>
    )
  }

  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メインフッターコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* ブランド情報 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Paintly</h3>
            <p className="text-sm text-gray-600">
              AI塗装シミュレーションツール
            </p>
            <p className="text-sm text-gray-600 mt-2">
              建物の塗装後の仕上がりを瞬時にシミュレーション
            </p>
          </div>

          {/* リンク集 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">サービス</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  料金プラン
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  よくある質問
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  設定
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的文書 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">法的文書</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  特定商取引法表記
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 Paintly. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            このサイトはreCAPTCHAによって保護されており、Googleの
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              プライバシーポリシー
            </a>
            と
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              Googleの利用規約
            </a>
            が適用されます。
          </p>
        </div>
      </div>
    </footer>
  )
}
