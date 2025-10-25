import { Inter, Noto_Sans_JP, Caveat } from 'next/font/google'

// Inter font for headings and English text
// LCP optimization: reduced from all weights to 4 weights for faster loading
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', 'arial'],
})

// Noto Sans JP for Japanese text - clean, readable appearance with Japanese support
// LCP optimization: reduced from 5 weights to 2 for faster loading
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: true,
  weight: ['400', '700'],
  fallback: ['system-ui', 'arial'],
})

// Caveat for handwritten style
// LCP optimization: reduced from 4 weights to 2 for faster loading
export const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
  weight: ['400', '700'],
  fallback: ['cursive'],
})

// CSS class names for easy use
// これらの変数がglobals.cssで--font-sans, --font-handwrittenなどとして使用されます
export const fontClassNames = `${inter.variable} ${notoSansJP.variable} ${caveat.variable}`