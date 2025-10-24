'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Google Analytics Measurement ID（環境変数から取得）
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Google Analytics 4（GA4）最適化コンポーネント
 *
 * Next.jsのScript戦略を使用して最適なタイミングでロード
 * ページ遷移を自動的にトラッキング
 */
export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    // ページビューを記録（クライアントサイドルーティング対応）
    if (pathname) {
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      })
    }
  }, [pathname, searchParams])

  // 環境変数が設定されていない場合はレンダリングしない
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics Global Site Tag（gtag.js） */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive" // ページがインタラクティブになった後にロード
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />
    </>
  )
}

/**
 * カスタムイベントを送信するヘルパー関数
 *
 * @example
 * // 画像生成イベントを記録
 * trackEvent('generate_image', {
 *   category: 'engagement',
 *   label: 'wall_color_change',
 * })
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (!GA_MEASUREMENT_ID) return

  window.gtag?.('event', eventName, params)
}

/**
 * カスタムディメンションを設定するヘルパー関数
 *
 * @example
 * // ユーザープランを記録
 * setUserProperties({
 *   plan: 'standard',
 *   generation_count: 45,
 * })
 */
export function setUserProperties(properties: Record<string, string | number | boolean>) {
  if (!GA_MEASUREMENT_ID) return

  window.gtag?.('set', 'user_properties', properties)
}

// グローバル型定義の拡張
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetIdOrType: string,
      params?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}
