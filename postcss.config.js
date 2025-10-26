module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 本番環境でCSS圧縮・最適化（11 KiB未使用CSS削減目標）
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'default',
              {
                // 未使用CSSルールの削減
                discardComments: { removeAll: true }, // コメント削除
                discardUnused: true, // 未使用ルール削減
                mergeRules: true, // 重複ルール統合
                minifySelectors: true, // セレクター最小化
                normalizeWhitespace: true, // 空白正規化
                // カラーコード最適化
                colormin: true,
                // フォント最適化
                minifyFontValues: true,
                // URL最適化
                normalizeUrl: true,
                // calc()最適化
                calc: true,
                // 単位最適化
                reduceInitial: true,
              },
            ],
          },
        }
      : {}),
  },
}