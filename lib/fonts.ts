import { Inter, M_PLUS_Rounded_1c, Caveat } from 'next/font/google'

// Inter font for headings and English text
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

// M PLUS Rounded 1c for Japanese text - rounded, friendly appearance
export const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mplus-rounded',
  preload: true,
  weight: ['300', '400', '500', '700', '800'],
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
export const fontClassNames = `${inter.variable} ${mPlusRounded.variable} ${caveat.variable}`