import { Inter, Noto_Sans_JP } from 'next/font/google'

// Inter font for headings and English text
// LCP optimization: reduced to only 2 essential weights (400 normal, 700 bold)
// display: 'optional' - Don't block LCP waiting for font, show fallback if not ready within 100ms
export const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  weight: ['400', '700'],
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
})

// Noto Sans JP for Japanese text - clean, readable appearance with Japanese support
// LCP optimization: reduced to single weight (400) to minimize font requests
// Note: Japanese fonts are split into multiple Unicode subsets by Next.js (can result in 15-20 requests per weight)
// display: 'optional' - Don't block LCP waiting for font, show fallback if not ready within 100ms
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-noto-sans-jp',
  preload: true,
  weight: ['400'],
  fallback: ['system-ui', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', 'MS PGothic', 'sans-serif'],
})

// Caveat removed - decorative font not essential for LCP performance
// Use system cursive font as fallback for handwritten styles

// CSS class names for easy use
// これらの変数がglobals.cssで--font-sans, --font-handwrittenなどとして使用されます
export const fontClassNames = `${inter.variable} ${notoSansJP.variable}`