import { MetadataRoute } from 'next'

/**
 * robots.txt の設定
 * 検索エンジンクローラーの巡回を制御し、サイトマップを通知
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // APIエンドポイントは非公開
          '/dashboard/',     // ダッシュボードは認証必須
          '/customer/',      // 顧客ページは認証必須
          '/settings/',      // 設定ページは認証必須
          '/billing/',       // 請求ページは認証必須
          '/test*',          // テストページは非公開
          '/auth/callback/', // 認証コールバックは非公開
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/customer/',
          '/settings/',
          '/billing/',
          '/test*',
          '/auth/callback/',
        ],
        crawlDelay: 0, // Googlebotには遅延なし
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/customer/',
          '/settings/',
          '/billing/',
          '/test*',
          '/auth/callback/',
        ],
        crawlDelay: 1, // Bingbotは1秒遅延
      },
    ],
    sitemap: 'https://paintly.pro/sitemap.xml',
  }
}
