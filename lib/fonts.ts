import { Inter } from 'next/font/google'

// Inter font for headings and English text
// LCP optimization: reduced to only 2 essential weights (400 normal, 700 bold)
// display: 'optional' - Don't block LCP waiting for font, show fallback if not ready within 100ms
// Japanese text uses system fonts only (no web font loading) to eliminate 32 font requests
export const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  weight: ['400', '700'],
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    // Japanese system fonts (used for Japanese text when Inter doesn't cover it)
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic',
    'Meiryo',
    'MS PGothic',
    'Arial',
    'sans-serif'
  ],
})

// Noto Sans JP removed - massive performance impact (32 font requests for Unicode subsets)
// Japanese text now uses native system fonts which render instantly without network requests
// Expected impact: Render Delay 5,700ms → <500ms, LCP 6.61s → <3s

// Caveat removed - decorative font not essential for LCP performance
// Use system cursive font as fallback for handwritten styles

// CSS class names for easy use
// Only Inter is loaded; Japanese text uses system fonts from fallback chain
export const fontClassNames = `${inter.variable}`