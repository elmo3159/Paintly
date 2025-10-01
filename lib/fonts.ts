import { Inter, Noto_Sans_JP } from 'next/font/google'

// Inter font for headings and English text
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// Noto Sans JP for Japanese text and body content
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
  fallback: ['system-ui', 'arial'],
})

// CSS class names for easy use
export const fontClassNames = `${inter.variable} ${notoSansJP.variable}`