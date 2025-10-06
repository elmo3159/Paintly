import { Inter, M_PLUS_Rounded_1c } from 'next/font/google'

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

// CSS class names for easy use
export const fontClassNames = `${inter.variable} ${mPlusRounded.variable}`