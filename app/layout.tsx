import type { Metadata } from 'next'
import './globals.css'
// import { ThemeProvider } from '@/components/theme-provider'
// import { ErrorBoundary } from '@/components/error-boundary'
import { fontClassNames } from '@/lib/fonts'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL('https://paintly.pro'),
  title: {
    default: 'Paintly - AI塗装シミュレーションツール | 営業成約率を劇的に向上',
    template: '%s | Paintly'
  },
  description: '建物の写真をアップロードするだけで、AI技術を使って140色の高精度な塗装シミュレーションを瞬時に生成。塗装業者・リフォーム業者の営業活動を革新し、成約率を大幅にアップさせる次世代ツール。その場でお客様に提案、競合他社との差別化を実現します。',
  keywords: '塗装シミュレーション,AI塗装,外壁塗装,屋根塗装,塗装業者ツール,営業支援,カラーシミュレーション,建築リフォーム,塗装見積もり,塗装提案,ビフォーアフター,塗装色選び,日塗工,建物塗装,住宅塗装',
  authors: [
    { name: 'Paintly Team', url: 'https://paintly.pro' },
  ],
  creator: 'Paintly',
  publisher: 'Paintly',
  category: 'Business Application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Paintly'
  },
  openGraph: {
    title: 'Paintly - AI塗装シミュレーションツール',
    description: '建物の写真から瞬時に塗装シミュレーションを生成。営業成約率を劇的に向上させる次世代ツール。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://paintly.pro',
    siteName: 'Paintly',
    images: [
      {
        url: 'https://paintly.pro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Paintly - AI塗装シミュレーションツール',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paintly - AI塗装シミュレーションツール',
    description: '建物の写真から瞬時に塗装シミュレーションを生成。営業成約率を劇的に向上。',
    creator: '@Paintly',
    site: '@Paintly',
    images: ['https://paintly.pro/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://paintly.pro',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover', // Safari Safe Area Insets有効化（iPhone X以降のノッチ対応）
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${fontClassNames} relative min-h-screen text-foreground`}
        suppressHydrationWarning
      >
        {/* <ErrorBoundary> */}
          {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          > */}
            {children}
            <div id="online-status" className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg hidden z-50" />
          {/* </ThemeProvider> */}
        {/* </ErrorBoundary> */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://paintly.pro/#organization",
                  "name": "Paintly",
                  "alternateName": "ペイントリー",
                  "description": "塗装会社向けAI塗装シミュレーションツールの開発・提供",
                  "url": "https://paintly.pro",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://paintly.pro/logo.png",
                    "width": 400,
                    "height": 200
                  },
                  "foundingDate": "2025",
                  "industry": "Software Development",
                  "areaServed": {
                    "@type": "Country",
                    "name": "Japan"
                  }
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://paintly.pro/#webapp",
                  "name": "Paintly - 塗装シミュレーションツール",
                  "alternateName": "ペイントリー",
                  "description": "建物の塗装後の仕上がりをAIで瞬時にシミュレーション。営業成約率を向上させる革新的なツール。",
                  "url": "https://paintly.pro",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web Browser, iOS, Android",
                  "browserRequirements": "HTML5, JavaScript enabled",
                  "author": {
                    "@id": "https://paintly.pro/#organization"
                  },
                  "publisher": {
                    "@id": "https://paintly.pro/#organization"
                  },
                  "offers": [
                    {
                      "@type": "Offer",
                      "name": "無料プラン",
                      "description": "3回まで画像生成可能",
                      "price": "0",
                      "priceCurrency": "JPY",
                      "category": "Free Trial"
                    },
                    {
                      "@type": "Offer",
                      "name": "ライトプラン",
                      "description": "月30回の画像生成",
                      "price": "2980",
                      "priceCurrency": "JPY",
                      "billingDuration": "P1M",
                      "category": "Subscription"
                    },
                    {
                      "@type": "Offer",
                      "name": "スタンダードプラン",
                      "description": "月100回の画像生成",
                      "price": "5980",
                      "priceCurrency": "JPY",
                      "billingDuration": "P1M",
                      "category": "Subscription"
                    },
                    {
                      "@type": "Offer",
                      "name": "プロプラン",
                      "description": "月300回の画像生成",
                      "price": "9980",
                      "priceCurrency": "JPY",
                      "billingDuration": "P1M",
                      "category": "Subscription"
                    }
                  ],
                  "featureList": [
                    "AI塗装シミュレーション",
                    "顧客管理システム",
                    "ビフォーアフター比較",
                    "色選択ツール",
                    "履歴管理",
                    "画像ダウンロード機能",
                    "モバイル対応",
                    "PWA対応"
                  ],
                  "screenshot": "https://paintly.pro/screenshot.png"
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://paintly.pro/#software",
                  "name": "Paintly",
                  "applicationCategory": "BusinessApplication",
                  "applicationSubCategory": "Construction & Renovation Tools",
                  "operatingSystem": "Web, iOS, Android",
                  "downloadUrl": "https://paintly.pro",
                  "installUrl": "https://paintly.pro",
                  "memoryRequirements": "512MB RAM",
                  "storageRequirements": "50MB",
                  "processorRequirements": "Any modern processor",
                  "softwareVersion": "1.0.0",
                  "datePublished": "2025-01-15",
                  "dateModified": "2025-01-15",
                  "author": {
                    "@id": "https://paintly.pro/#organization"
                  },
                  "publisher": {
                    "@id": "https://paintly.pro/#organization"
                  }
                },
                {
                  "@type": "Service",
                  "@id": "https://paintly.pro/#service",
                  "name": "AI塗装シミュレーションサービス",
                  "description": "AI技術を活用した建物塗装の事前シミュレーションサービス",
                  "provider": {
                    "@id": "https://paintly.pro/#organization"
                  },
                  "serviceType": "AI Simulation Service",
                  "areaServed": {
                    "@type": "Country",
                    "name": "Japan"
                  },
                  "audience": {
                    "@type": "BusinessAudience",
                    "audienceType": "塗装業者、建設業者、リフォーム業者"
                  },
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Paintly料金プラン",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "無料プラン",
                          "description": "お試し利用向け - 3回まで画像生成"
                        },
                        "price": "0",
                        "priceCurrency": "JPY"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "ライトプラン",
                          "description": "小規模事業者向け - 月30回画像生成"
                        },
                        "price": "2980",
                        "priceCurrency": "JPY",
                        "billingDuration": "P1M"
                      },
                      {
                        "@type": "Service",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "スタンダードプラン",
                          "description": "中規模事業者向け - 月100回画像生成"
                        },
                        "price": "5980",
                        "priceCurrency": "JPY",
                        "billingDuration": "P1M"
                      }
                    ]
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://paintly.pro/#website",
                  "url": "https://paintly.pro",
                  "name": "Paintly",
                  "description": "塗装シミュレーションツール - AI技術で建物の塗装後イメージを瞬時に生成",
                  "publisher": {
                    "@id": "https://paintly.pro/#organization"
                  },
                  "inLanguage": "ja-JP",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://paintly.pro/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://paintly.pro/#localbusiness",
                  "name": "Paintly",
                  "image": "https://paintly.pro/logo.png",
                  "description": "塗装業者・リフォーム業者向けAI塗装シミュレーションツールの開発・提供",
                  "url": "https://paintly.pro",
                  "telephone": "",
                  "priceRange": "¥0 - ¥19,800",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "JP",
                    "addressRegion": "日本全国"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 35.6762,
                    "longitude": 139.6503
                  },
                  "areaServed": [
                    {
                      "@type": "Country",
                      "name": "Japan"
                    }
                  ],
                  "serviceType": [
                    "塗装シミュレーション",
                    "AI画像生成",
                    "営業支援ツール",
                    "建築ビジュアライゼーション"
                  ],
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Paintly料金プラン",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "無料プラン"
                        },
                        "price": "0",
                        "priceCurrency": "JPY"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "ライトプラン"
                        },
                        "price": "2980",
                        "priceCurrency": "JPY"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "スタンダードプラン"
                        },
                        "price": "5980",
                        "priceCurrency": "JPY"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "プロプラン"
                        },
                        "price": "9980",
                        "priceCurrency": "JPY"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "ビジネスプラン"
                        },
                        "price": "19800",
                        "priceCurrency": "JPY"
                      }
                    ]
                  },
                  "openingHoursSpecification": [
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                      ],
                      "opens": "00:00",
                      "closes": "23:59"
                    }
                  ]
                }
              ]
            })
          }}
        />
        <Script
          id="global-error-handling"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced Global Error Handling System
              (function() {
                'use strict';

                // Error logging class with enhanced features
                class ErrorLogger {
                  constructor() {
                    this.logs = [];
                    this.maxLogs = 100;
                    this.sendQueue = [];
                    this.isOnline = navigator.onLine;
                    this.setupNetworkMonitoring();
                  }

                  setupNetworkMonitoring() {
                    window.addEventListener('online', () => {
                      this.isOnline = true;
                      this.flushQueue();
                    });

                    window.addEventListener('offline', () => {
                      this.isOnline = false;
                    });
                  }

                  log(error, errorType = 'unknown', context = {}) {
                    const errorLog = {
                      id: 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                      timestamp: new Date().toISOString(),
                      errorType,
                      message: typeof error === 'string' ? error : (error.message || String(error)),
                      userAgent: navigator.userAgent,
                      url: window.location.href,
                      userId: context.userId,
                      stackTrace: error.stack,
                      retryCount: context.retryCount || 0,
                      sessionId: this.getSessionId(),
                      viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                      },
                      performance: this.getPerformanceData()
                    };

                    // Store locally
                    this.logs.unshift(errorLog);
                    if (this.logs.length > this.maxLogs) {
                      this.logs = this.logs.slice(0, this.maxLogs);
                    }

                    // Store in localStorage for persistence
                    this.persistError(errorLog);

                    // Log to console in development
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                      console.error('[ErrorLogger] ' + errorType.toUpperCase() + ':', {
                        message: errorLog.message,
                        context,
                        stack: errorLog.stackTrace
                      });
                    }

                    // Send to server if critical error
                    if (errorType === 'auth' || errorType === 'api' || errorType === 'critical') {
                      this.reportError(errorLog);
                    }

                    // Show user notification for critical errors
                    if (errorType === 'critical' || errorType === 'auth') {
                      this.showErrorNotification(errorLog);
                    }
                  }

                  getSessionId() {
                    let sessionId = sessionStorage.getItem('paintly_session_id');
                    if (!sessionId) {
                      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                      sessionStorage.setItem('paintly_session_id', sessionId);
                    }
                    return sessionId;
                  }

                  getPerformanceData() {
                    if (performance && performance.getEntriesByType) {
                      const navigation = performance.getEntriesByType('navigation')[0];
                      return {
                        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
                        memoryUsage: performance.memory ? {
                          used: performance.memory.usedJSHeapSize,
                          total: performance.memory.totalJSHeapSize,
                          limit: performance.memory.jsHeapSizeLimit
                        } : null
                      };
                    }
                    return null;
                  }

                  persistError(errorLog) {
                    try {
                      const stored = JSON.parse(localStorage.getItem('paintly_error_logs') || '[]');
                      stored.unshift(errorLog);
                      // Keep only last 50 errors in localStorage
                      const limited = stored.slice(0, 50);
                      localStorage.setItem('paintly_error_logs', JSON.stringify(limited));
                    } catch (e) {
                      console.warn('Failed to persist error log:', e);
                    }
                  }

                  reportError(errorLog) {
                    if (this.isOnline) {
                      this.sendErrorToServer(errorLog);
                    } else {
                      this.sendQueue.push(errorLog);
                    }
                  }

                  async sendErrorToServer(errorLog) {
                    try {
                      await fetch('/api/error-reporting', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(errorLog)
                      });
                    } catch (error) {
                      console.warn('Failed to send error to server:', error);
                      this.sendQueue.push(errorLog);
                    }
                  }

                  flushQueue() {
                    while (this.sendQueue.length > 0) {
                      const errorLog = this.sendQueue.shift();
                      this.sendErrorToServer(errorLog);
                    }
                  }

                  showErrorNotification(errorLog) {
                    // Create error notification
                    const notification = document.createElement('div');
                    notification.className = 'paintly-error-notification';
                    notification.innerHTML = \`
                      <div style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #dc2626;
                        color: white;
                        padding: 16px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 10000;
                        max-width: 350px;
                        font-family: system-ui, -apple-system, sans-serif;
                        animation: slideInError 0.3s ease-out;
                      ">
                        <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                          ⚠️ エラーが発生しました
                          <button onclick="this.closest('.paintly-error-notification').remove()" style="
                            background: none;
                            border: none;
                            color: white;
                            font-size: 18px;
                            cursor: pointer;
                            margin-left: auto;
                            padding: 0;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                          ">×</button>
                        </div>
                        <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
                          \${errorLog.message}
                        </div>
                        <div style="font-size: 12px; opacity: 0.7;">
                          エラーID: \${errorLog.id.split('_')[2]}
                        </div>
                      </div>
                      <style>
                        @keyframes slideInError {
                          from { transform: translateX(100%); opacity: 0; }
                          to { transform: translateX(0); opacity: 1; }
                        }
                      </style>
                    \`;

                    document.body.appendChild(notification);

                    // Auto-remove after 10 seconds
                    setTimeout(() => {
                      if (notification.parentNode) {
                        notification.remove();
                      }
                    }, 10000);
                  }

                  // Public methods for debugging
                  getAllLogs() {
                    return [...this.logs];
                  }

                  getStoredLogs() {
                    try {
                      return JSON.parse(localStorage.getItem('paintly_error_logs') || '[]');
                    } catch {
                      return [];
                    }
                  }

                  clearLogs() {
                    this.logs = [];
                    localStorage.removeItem('paintly_error_logs');
                  }

                  exportLogs() {
                    const allLogs = {
                      session: this.logs,
                      stored: this.getStoredLogs(),
                      systemInfo: {
                        userAgent: navigator.userAgent,
                        viewport: {
                          width: window.innerWidth,
                          height: window.innerHeight
                        },
                        url: window.location.href,
                        timestamp: new Date().toISOString()
                      }
                    };
                    return JSON.stringify(allLogs, null, 2);
                  }
                }

                // Initialize global error logger
                window.paintlyErrorLogger = new ErrorLogger();

                // Enhanced global error handlers
                window.addEventListener('error', (event) => {
                  const error = event.error || new Error(event.message);
                  window.paintlyErrorLogger.log(error, 'javascript', {
                    filename: event.filename,
                    lineNumber: event.lineno,
                    columnNumber: event.colno
                  });
                });

                window.addEventListener('unhandledrejection', (event) => {
                  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
                  window.paintlyErrorLogger.log(error, 'promise', {
                    type: 'unhandledrejection'
                  });

                  // Prevent the default browser behavior (console error)
                  event.preventDefault();
                });

                // Resource loading errors
                window.addEventListener('error', (event) => {
                  if (event.target !== window && event.target.tagName) {
                    window.paintlyErrorLogger.log(
                      new Error(\`Failed to load \${event.target.tagName}: \${event.target.src || event.target.href}\`),
                      'resource',
                      {
                        element: event.target.tagName,
                        source: event.target.src || event.target.href
                      }
                    );
                  }
                }, true);

                // Console error interception (for development)
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  const originalConsoleError = console.error;
                  console.error = function(...args) {
                    // Check if this is a React error or other framework error
                    const message = args.join(' ');
                    if (message.includes('Warning:') || message.includes('React') || message.includes('Next.js')) {
                      window.paintlyErrorLogger.log(new Error(message), 'framework', {
                        source: 'console.error'
                      });
                    }
                    originalConsoleError.apply(console, args);
                  };
                }

                // Global function to manually report errors
                window.reportError = function(error, type = 'manual', context = {}) {
                  window.paintlyErrorLogger.log(error, type, context);
                };

                // Debug functions for development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  window.debugErrorLogs = function() {
                    console.group('🐛 Paintly Error Logs Debug');
                    console.log('Session Logs:', window.paintlyErrorLogger.getAllLogs());
                    console.log('Stored Logs:', window.paintlyErrorLogger.getStoredLogs());
                    console.log('Export All:', window.paintlyErrorLogger.exportLogs());
                    console.groupEnd();
                  };

                  window.clearErrorLogs = function() {
                    window.paintlyErrorLogger.clearLogs();
                    console.log('✅ Error logs cleared');
                  };
                }

                console.log('🛡️ Paintly Global Error Handling initialized');
              })();
            `,
          }}
        />
        <Script
          id="pwa-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced PWA Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    // Register service worker
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'imports'
                    });

                    console.log('🎨 Paintly SW registered:', registration.scope);

                    // Check for service worker updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, show update notification
                            showUpdateNotification();
                          }
                        });
                      }
                    });

                    // Listen for messages from service worker
                    navigator.serviceWorker.addEventListener('message', (event) => {
                      if (event.data && event.data.type === 'CACHE_UPDATED') {
                        console.log('📦 Cache updated:', event.data.url);
                      }
                    });

                    // Request notification permissions for PWA features
                    if ('Notification' in window && Notification.permission === 'default') {
                      setTimeout(() => {
                        requestNotificationPermission();
                      }, 3000); // Wait 3 seconds before asking
                    }

                    // Set up background sync if supported
                    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                      console.log('🔄 Background sync supported');
                    }

                    // Monitor online/offline status
                    window.addEventListener('online', () => {
                      console.log('🌐 App is online');
                      showConnectionStatus('online');
                    });

                    window.addEventListener('offline', () => {
                      console.log('📱 App is offline');
                      showConnectionStatus('offline');
                    });

                  } catch (error) {
                    console.error('❌ Service worker registration failed:', error);
                    if (window.reportError) {
                      window.reportError(error, 'sw_registration');
                    }
                  }
                });
              }

              function showUpdateNotification() {
                // Create update notification
                const notification = document.createElement('div');
                notification.id = 'sw-update-notification';
                notification.innerHTML = \`
                  <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #3b82f6;
                    color: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-width: 300px;
                    font-family: system-ui, -apple-system, sans-serif;
                  ">
                    <div style="font-weight: 600; margin-bottom: 8px;">
                      🚀 新しいバージョンが利用可能です
                    </div>
                    <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
                      アプリを更新して新機能を利用しましょう
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button onclick="updateServiceWorker()" style="
                        background: white;
                        color: #3b82f6;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                      ">更新</button>
                      <button onclick="dismissUpdateNotification()" style="
                        background: transparent;
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 14px;
                        cursor: pointer;
                      ">後で</button>
                    </div>
                  </div>
                \`;
                document.body.appendChild(notification);
              }

              function updateServiceWorker() {
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }

              function dismissUpdateNotification() {
                const notification = document.getElementById('sw-update-notification');
                if (notification) {
                  notification.remove();
                }
              }

              async function requestNotificationPermission() {
                try {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    console.log('✅ Notification permission granted');

                    // Show welcome notification
                    new Notification('Paintly PWA', {
                      body: 'アプリがインストールされました！オフラインでも利用可能です。',
                      icon: '/icon-192.png',
                      badge: '/icon-96.png',
                      tag: 'welcome'
                    });
                  } else {
                    console.log('❌ Notification permission denied');
                  }
                } catch (error) {
                  console.error('Notification permission error:', error);
                  if (window.reportError) {
                    window.reportError(error, 'notification_permission');
                  }
                }
              }

              function showConnectionStatus(status) {
                // Remove existing status
                const existing = document.getElementById('connection-status');
                if (existing) existing.remove();

                // Create new status indicator
                const statusEl = document.createElement('div');
                statusEl.id = 'connection-status';
                statusEl.innerHTML = \`
                  <div style="
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: \${status === 'online' ? '#10b981' : '#f59e0b'};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 1000;
                    font-family: system-ui, -apple-system, sans-serif;
                    animation: slideIn 0.3s ease-out;
                  ">
                    \${status === 'online' ? '🌐 オンライン' : '📱 オフライン'}
                  </div>
                  <style>
                    @keyframes slideIn {
                      from { transform: translateX(-100%); opacity: 0; }
                      to { transform: translateX(0); opacity: 1; }
                    }
                  </style>
                \`;
                document.body.appendChild(statusEl);

                // Auto-hide after 3 seconds
                setTimeout(() => {
                  if (statusEl) statusEl.remove();
                }, 3000);
              }

              // PWA Install prompt handling
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('💾 PWA install prompt available');
                e.preventDefault();
                deferredPrompt = e;

                // Show custom install button (can be implemented in React components)
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });

              window.addEventListener('appinstalled', () => {
                console.log('🎉 PWA installed successfully');
                deferredPrompt = null;

                // Show success message
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Paintly インストール完了', {
                    body: 'アプリが正常にインストールされました！',
                    icon: '/icon-192.png',
                    tag: 'install-success'
                  });
                }
              });

              // Global function to trigger PWA install
              window.installPWA = async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  console.log('PWA install outcome:', outcome);
                  deferredPrompt = null;
                }
              };
            `,
          }}
        />
      </body>
    </html>
  )
}