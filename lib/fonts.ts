import { Inter, Noto_Sans_JP, Caveat } from 'next/font/google'

// Inter font for headings and English text
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// Noto Sans JP for Japanese text - clean, readable appearance with Japanese support
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: true,
  weight: ['300', '400', '500', '700', '900'],
  fallback: ['system-ui', 'arial'],
})

// Caveat for handwritten style
export const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
  weight: ['400', '500', '600', '700'],
  fallback: ['cursive'],
})

// CSS class names for easy use
// これらの変数がglobals.cssで--font-sans, --font-handwrittenなどとして使用されます
export const fontClassNames = `${inter.variable} ${notoSansJP.variable} ${caveat.variable}`