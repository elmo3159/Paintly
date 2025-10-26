const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // Cross-origin警告解決
  allowedDevOrigins: [
    '172.17.161.101:9090',
    'localhost:9090',
    '127.0.0.1:9090',
    '0.0.0.0:9090'
  ],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.fal.media',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 330, 384],
    minimumCacheTTL: 60,
  },
  
  // ModularizeImports - 未使用コード削減（195KB削減目標）
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },

  experimental: {
    // SWC強制トランスパイル（ES2022+ターゲット、ポリフィル削除）
    forceSwcTransforms: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-checkbox',
      '@supabase/supabase-js',
      '@fal-ai/client',
      'framer-motion',
      'react-dropzone'
    ],
    // Critical CSS optimization - DISABLED: Critters doesn't support App Router streaming
    // optimizeCss: true,  // Not working with App Router, causing issues
    // CSS最小化とTree Shaking強化
    cssChunking: 'strict',
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // SWCコンパイラ最適化（ポリフィル削減、ES2022+対応）
  // Next.js 15ではSWC Minifyがデフォルト有効（swcMinifyオプションは削除済み）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // 本番環境でReactプロパティ削除（data-testid等）
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Emotion/styled-components不使用なので無効化
    emotion: false,
    styledComponents: false,
  },


  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, immutable',
          },
        ],
      },
    ]
  },
  
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ]
  },
  
  env: {
    NEXT_PUBLIC_APP_NAME: 'Paintly',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // 本番環境でのみstandaloneを使用
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // webpack設定の最適化

  webpack: (config, { dev, isServer }) => {
    // 開発モードでの最適化
    if (dev && !isServer) {
      // チャンクロード タイムアウトを延長
      config.output.chunkLoadTimeout = 120000; // 120秒
      
      // 開発モードでもモジュール分割によるパフォーマンス向上
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
              chunks: 'all',
            },
            react: {
              test: /[\/]node_modules[\/](react|react-dom)[\/]/,
              name: 'react',
              priority: 20,
              reuseExistingChunk: true,
            },
            ui: {
              test: /[\/]node_modules[\/]@radix-ui[\/]/,
              name: 'ui-components',
              priority: 15,
              reuseExistingChunk: true,
            },
            supabase: {
              test: /[\/]node_modules[\/]@supabase[\/]/,
              name: 'supabase',
              priority: 15,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // 開発時のモジュール解決最適化
      config.resolve.symlinks = false;
      config.watchOptions = {
        ignored: /node_modules/,
        poll: false,
      };
    }
    
    if (!dev && !isServer) {
      // 本番環境でのバンドル最適化（Unused JS削減）
      config.optimization = {
        ...config.optimization,
        // Tree shaking強化（195KB未使用JS削減）
        minimize: true,
        usedExports: true,
        providedExports: true,
        sideEffects: true,
        innerGraph: true,
        // より細かいchunk分割でunused JS削減
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200KB以上は分割
          minSize: 10000,  // 10KB以下は統合
          maxInitialRequests: 30, // 初期リクエスト数上限（より細かい分割許可）
          maxAsyncRequests: 30,   // 非同期リクエスト数上限
          cacheGroups: {
            // React Core（最小限のコア、個別キャッシュ）
            reactCore: {
              test: /[\/]node_modules[\/]react[\/]/,
              name: 'react-core',
              priority: 35,
              reuseExistingChunk: true,
              enforce: true,
            },
            // ReactDOM（React本体と分離）
            reactDom: {
              test: /[\/]node_modules[\/]react-dom[\/]/,
              name: 'react-dom',
              priority: 34,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Scheduler（React内部依存）
            reactScheduler: {
              test: /[\/]node_modules[\/]scheduler[\/]/,
              name: 'react-scheduler',
              priority: 33,
              reuseExistingChunk: true,
            },
            // Supabase SSR（認証用、頻繁に使用）
            supabaseSSR: {
              test: /[\/]node_modules[\/]@supabase[\/]ssr[\/]/,
              name: 'supabase-ssr',
              priority: 28,
              reuseExistingChunk: true,
            },
            // Supabase Client（データアクセス用）
            supabaseClient: {
              test: /[\/]node_modules[\/]@supabase[\/]supabase-js[\/]/,
              name: 'supabase-client',
              priority: 27,
              reuseExistingChunk: true,
            },
            // Radix UI - Dialog系（使用頻度低、動的ロード推奨）
            radixDialog: {
              test: /[\/]node_modules[\/]@radix-ui[\/]react-dialog[\/]/,
              name: 'radix-dialog',
              priority: 26,
              reuseExistingChunk: true,
            },
            // Radix UI - その他コンポーネント
            radixOther: {
              test: /[\/]node_modules[\/]@radix-ui[\/]/,
              name: 'radix-ui',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Lucide Icons（Tree Shakingで既に最適化済み）
            lucide: {
              test: /[\/]node_modules[\/]lucide-react[\/]/,
              name: 'lucide-icons',
              priority: 20,
              reuseExistingChunk: true,
            },
            // FAL AI（画像生成ページのみ使用）
            fal: {
              test: /[\/]node_modules[\/]@fal-ai[\/]/,
              name: 'fal-ai',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Stripe（決済ページのみ使用）
            stripe: {
              test: /[\/]node_modules[\/](@stripe|stripe)[\/]/,
              name: 'stripe',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Framer Motion（アニメーションページのみ）
            framer: {
              test: /[\/]node_modules[\/]framer-motion[\/]/,
              name: 'framer-motion',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Google Generative AI（画像生成APIのみ使用）
            gemini: {
              test: /[\/]node_modules[\/]@google[\/]generative-ai[\/]/,
              name: 'gemini-ai',
              priority: 20,
              reuseExistingChunk: true,
            },
            // その他のvendor（細かく分割）
            vendor: {
              test: /[\/]node_modules[\/]/,
              name(module) {
                const packageName = module.context.match(/[\/]node_modules[\/](.*?)([\/]|$)/)[1];
                return `vendor.${packageName.replace('@', '')}`;
              },
              priority: 10,
              reuseExistingChunk: true,
              minSize: 20000, // 20KB以上のみ個別分離
            },
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)