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
  
  experimental: {
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
    optimizeCss: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
        // Tree shaking強化
        usedExports: true,
        sideEffects: true,
        // より細かいchunk分割でunused JS削減
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200KB以上は分割
          minSize: 10000,  // 10KB以下は統合
          cacheGroups: {
            // React本体（最優先、頻繁に使用）
            react: {
              test: /[\/]node_modules[\/](react|react-dom)[\/]/,
              name: 'react-vendor',
              priority: 30,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Supabase（ページごとに使用有無が異なる）
            supabase: {
              test: /[\/]node_modules[\/]@supabase[\/]/,
              name: 'supabase',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Radix UI（コンポーネントごとに分割可能）
            radix: {
              test: /[\/]node_modules[\/]@radix-ui[\/]/,
              name: 'radix-ui',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Lucide Icons（アイコン大量、分割効果大）
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
            // その他のvendor（低優先度）
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)