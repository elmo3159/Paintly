'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Star, Palette, CheckCircle, XCircle, ChevronRight, ChevronDown, QrCode } from 'lucide-react'

// Dynamic imports for performance optimization
const LegalFooter = dynamic(() => import('@/components/legal-footer').then(mod => ({ default: mod.LegalFooter })), {
  ssr: false,
  loading: () => <div className="h-96 bg-white" />
})

const Reviews = dynamic(() => import('@/components/reviews').then(mod => ({ default: mod.Reviews })), {
  ssr: false,
  loading: () => <div className="h-64 bg-secondary/30" />
})

const PricingSection = dynamic(() => import('@/components/pricing-section').then(mod => ({ default: mod.PricingSection })), {
  ssr: false,
  loading: () => <div className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 animate-pulse" />
})

const FaqSection = dynamic(() => import('@/components/faq-section').then(mod => ({ default: mod.FaqSection })), {
  ssr: false,
  loading: () => <div className="py-16 md:py-24 bg-white animate-pulse" />
})

const ReactCompareSlider = dynamic(() => import('react-compare-slider').then(mod => ({ default: mod.ReactCompareSlider })), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-secondary/30 rounded-lg animate-pulse" />
})

const ReactCompareSliderImage = dynamic(() => import('react-compare-slider').then(mod => ({ default: mod.ReactCompareSliderImage })), {
  ssr: false
})

export default function HomePage() {
  const router = useRouter()
  const [videoLoaded, setVideoLoaded] = useState(false)

  // LCP OPTIMIZATION: Non-blocking auth check - don't block initial render
  // Previous implementation blocked LCP for 500-1000ms+ waiting for auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Dynamic import Supabase client to reduce initial bundle size
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Silently redirect if already logged in (no loading screen)
        if (user) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }

    // Run auth check in background without blocking render
    checkAuth()
  }, [router])

  // LCP optimization: Delay video loading until after critical resources
  useEffect(() => {
    const loadVideo = () => {
      setVideoLoaded(true)
    }

    // Start video after page is fully loaded
    if (document.readyState === 'complete') {
      loadVideo()
    } else {
      window.addEventListener('load', loadVideo)
      return () => window.removeEventListener('load', loadVideo)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden">
      {/* BreadcrumbList構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/`
              }
            ]
          })
        }}
      />

      {/* VideoObject構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Paintly - AI塗装シミュレーションデモ",
            "description": "Paintlyを使った塗装シミュレーションの実演動画。スマートフォンで建物の写真を撮影し、140色から色を選択するだけで、AIが瞬時に高精度な塗装後のイメージを生成します。",
            "thumbnailUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/bg-paint-drip.png`,
            "uploadDate": "2025-01-10",
            "duration": "PT30S",
            "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/demo/slider-demo.mp4`,
            "embedUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/demo/slider-demo.mp4`
          })
        }}
      />

      {/* 第1画面: すべてのコンテンツを統合（背景動画） */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 背景動画 - LCP最適化: ページ読み込み完了後に遅延読み込み */}
        {videoLoaded && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/demo/slider-demo.mp4" type="video/mp4" />
          </video>
        )}

        {/* ダークオーバーレイ */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* コンテンツ */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center py-2">
          <div className="max-w-7xl mx-auto w-full space-y-3">
            {/* ロゴ */}
            <div className="relative inline-block mx-auto mb-2 md:-mt-8">
              {/* 白いぼかし背景 */}
              <div
                className="absolute inset-0 -inset-x-6 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 40%, rgba(255, 255, 255, 0) 70%)'
                }}
              />
              <Image
                src="/logo.png"
                alt="Paintly - AI塗装シミュレーションツールのロゴ"
                width={284}
                height={160}
                priority={true}
                fetchPriority="high"
                className="h-24 md:h-28 w-auto object-contain relative z-10"
              />
            </div>

            {/* バッジ */}
            <div>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                <Star className="h-3 w-3 md:h-4 md:w-4" />
                一瞬で140色の高精度なシミュレーション
              </span>
            </div>

            {/* メインタイトル */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 1px 1px 0 rgba(0,0,0,0.5)'
                }}>
              営業成約率を劇的に向上させる<br />
              塗装シミュレーション
            </h1>

            {/* キャッチフレーズ */}
            <div>
              <p className="text-lg md:text-3xl font-bold text-white leading-tight">
                「この家に住みたい」<br />
                <span className="text-sm md:text-xl text-white/90">お客様がそう思った瞬間、</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                  営業は終わっている。
                </span>
              </p>
            </div>

            {/* フロー比較（コンパクト版） */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
              {/* 従来 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-3 border border-red-500/30">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                  従来
                </div>
                <div className="flex items-center justify-center gap-1 text-white/90 flex-wrap text-xs">
                  <span>持ち帰り</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span>時間経過</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span>熱量低下</span>
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <span className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="font-bold text-red-400">失注</span>
                  </span>
                </div>
              </div>

              {/* Paintly */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-3 border border-green-500/30">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                  Paintly
                </div>
                <div className="flex items-center justify-center gap-1 text-white/90 flex-wrap text-xs">
                  <span>その場で感動</span>
                  <ChevronRight className="w-3 h-3 text-green-400" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 font-bold">熱量MAX</span>
                  <ChevronRight className="w-3 h-3 text-green-400" />
                  <span className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="font-bold text-green-400">即決</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 説明文 */}
            <div className="max-w-3xl mx-auto mb-6">
              <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                現地調査などの際に建物の写真を撮影→色を選ぶだけで瞬時に塗装後の仕上がり画像が作成されます。<br />
                <span className="text-sm md:text-base text-orange-400 font-semibold">その場でお客様に見せ、競合他社との差別化を図り</span>成約率を大幅にアップします。
              </p>
            </div>

            {/* モバイル: CTAボタン中央配置 + 詳しくボタン左側配置 */}
            <div className="relative">
              {/* もっと詳しくボタン - モバイルでのみ左側に表示 */}
              <button
                onClick={() => {
                  const nextSection = document.querySelector('section:nth-of-type(2)');
                  nextSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-label="下にスクロール"
                className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer animate-scroll-bounce z-10"
                style={{ transitionDuration: '300ms' }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    詳しく
                  </span>
                  <ChevronDown className="h-7 w-7" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                </div>
              </button>

              {/* CTAボタン - 中央配置 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 md:px-8 md:py-5 text-sm md:text-base font-bold shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:shadow-[0_12px_40px_rgb(249,115,22,0.5)] border-2 border-orange-400 transition-all duration-300 transform hover:scale-105">
                    <Star className="mr-2 h-4 w-4" />
                    無料で始める
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-black px-6 py-4 md:px-8 md:py-5 text-sm md:text-base font-bold shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-105">
                    <Palette className="mr-2 h-4 w-4" />
                    ログインして続ける
                  </Button>
                </Link>
              </div>
            </div>

            {/* スクロール誘導アニメーション - sm以上でabsolute表示 */}
            <button
              onClick={() => {
                const nextSection = document.querySelector('section:nth-of-type(2)');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="下にスクロール"
              className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer animate-scroll-bounce"
              style={{ transitionDuration: '300ms' }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs md:text-sm font-semibold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  もっと詳しく
                </span>
                <ChevronDown className="h-8 w-8 md:h-10 md:w-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Before/After実例ギャラリーセクション */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* SEO構造化データ: ImageGallery */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageGallery",
              "name": "Paintly AI塗装シミュレーション実例",
              "description": "実際の建物にPaintlyを使用して塗装シミュレーションを行った実例。瞬時に高精度なビフォーアフター画像を生成します。",
              "associatedMedia": [
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例1 - Before",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-Before1.png`,
                  "description": "Paintly使用前の建物写真",
                  "encodingFormat": "image/png"
                },
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例1 - After",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-After1.jpg`,
                  "description": "Paintly使用後のAI生成塗装イメージ",
                  "encodingFormat": "image/jpeg"
                },
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例2 - Before",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-Before2.png`,
                  "description": "Paintly使用前の建物写真",
                  "encodingFormat": "image/png"
                },
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例2 - After",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-After2.png`,
                  "description": "Paintly使用後のAI生成塗装イメージ",
                  "encodingFormat": "image/png"
                },
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例3 - Before",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-Before3.png`,
                  "description": "Paintly使用前の建物写真",
                  "encodingFormat": "image/png"
                },
                {
                  "@type": "ImageObject",
                  "name": "塗装シミュレーション実例3 - After",
                  "contentUrl": `${typeof window !== 'undefined' ? window.location.origin : ''}/LP-After3.png`,
                  "description": "Paintly使用後のAI生成塗装イメージ",
                  "encodingFormat": "image/png"
                }
              ]
            })
          }}
        />

        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* メインヘッドライン */}
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 leading-tight">
              <span className="block whitespace-nowrap">このクオリティが</span>
              <span className="block whitespace-nowrap">一瞬で。</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              実際の建物にPaintlyを使用したAI塗装シミュレーション実例。<br />
              スライダーを左右に動かして、ビフォーアフターの違いをご確認ください。
            </p>
          </div>

          {/* Before/Afterスライダーギャラリー */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* 実例1 */}
            <article className="group">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20" style={{willChange: 'transform'}}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">実例 1</span>
                    <span className="text-xs text-gray-400">スライダーを動かす ↓</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">実例 1</h3>
                  <p className="text-sm text-gray-400">外壁カラー変更シミュレーション</p>
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl" style={{contain: 'layout style paint', contentVisibility: 'auto'}}>
                  <ReactCompareSlider
                    itemOne={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-Before1.png"
                          alt="塗装前の一戸建て住宅"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    itemTwo={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-After1.jpg"
                          alt="Paintly AI生成による塗装後イメージ"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    className="h-full w-full"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    Before
                  </span>
                  <span className="flex items-center gap-1">
                    After
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  </span>
                </div>
              </div>
            </article>

            {/* 実例2 */}
            <article className="group">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20" style={{willChange: 'transform'}}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">実例 2</span>
                    <span className="text-xs text-gray-400">スライダーを動かす ↓</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">実例 2</h3>
                  <p className="text-sm text-gray-400">複数色組み合わせシミュレーション</p>
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl" style={{contain: 'layout style paint', contentVisibility: 'auto'}}>
                  <ReactCompareSlider
                    itemOne={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-Before2.png"
                          alt="塗装前の一戸建て住宅"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    itemTwo={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-After2.png"
                          alt="Paintly AI生成による塗装後イメージ"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    className="h-full w-full"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    Before
                  </span>
                  <span className="flex items-center gap-1">
                    After
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  </span>
                </div>
              </div>
            </article>

            {/* 実例3 */}
            <article className="group">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20" style={{willChange: 'transform'}}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">実例 3</span>
                    <span className="text-xs text-gray-400">スライダーを動かす ↓</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">実例 3</h3>
                  <p className="text-sm text-gray-400">屋根・外壁一括変更シミュレーション</p>
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl" style={{contain: 'layout style paint', contentVisibility: 'auto'}}>
                  <ReactCompareSlider
                    itemOne={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-Before3.png"
                          alt="塗装前の一戸建て住宅"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    itemTwo={
                      <div className="relative w-full h-full">
                        <Image
                          src="/LP-After3.png"
                          alt="Paintly AI生成による塗装後イメージ"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="330px"
                          quality={75}
                          priority={false}
                        />
                      </div>
                    }
                    className="h-full w-full"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    Before
                  </span>
                  <span className="flex items-center gap-1">
                    After
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* 魅力的なコピーセクション */}
          <div className="mt-20 mb-16 relative">
            {/* 装飾的な背景 - blur軽減 */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>

            <div className="relative space-y-12">
              {/* メインコピー1 */}
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  <span className="block text-white mb-3">
                    必要なのは
                    <span className="inline-block mx-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      📱 スマホだけ
                    </span>
                  </span>
                  <span
                    className="block bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300"
                  >
                    様変わりした自宅を見て
                  </span>
                  <span className="block text-white mt-3">
                    お客様は
                    <span className="inline-block mx-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-xl">
                      感動
                    </span>
                    するはずです。
                  </span>
                </h2>
              </div>

              {/* 区切り装飾 */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"></div>
                <Star className="h-8 w-8 text-orange-400" />
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"></div>
              </div>

              {/* メインコピー2 */}
              <div className="text-center max-w-5xl mx-auto">
                <h2 className="font-bold leading-relaxed">
                  {/* 写真を撮って + 色を選ぶ（常に横並び） */}
                  <span className="flex flex-wrap justify-center items-center gap-3 mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    <span className="inline-block bg-white/10 px-3 sm:px-4 py-2 rounded-xl border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                      <span className="text-orange-300 whitespace-nowrap">📷 写真を撮って</span>
                    </span>
                    <span className="inline-block bg-white/10 px-3 sm:px-4 py-2 rounded-xl border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 whitespace-nowrap">
                        🎨 色を選ぶ
                      </span>
                    </span>
                  </span>

                  {/* これだけで誰でも簡単（一行に収める） */}
                  <span className="block text-white/90 text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4">
                    <span>これだけで</span>
                    <span className="mx-2">誰でも</span>
                    <span className="inline-block mx-1 px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl transform hover:scale-110 transition-all text-white font-extrabold">
                      簡単
                    </span>
                  </span>

                  {/* 一瞬で（単独で一行） */}
                  <span className="block mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                    <span className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl shadow-2xl animate-pulse-slow text-white font-black">
                      一瞬で
                    </span>
                  </span>

                  {/* シミュレーション画像が作れます */}
                  <span className="block mt-6 text-white/90 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 font-extrabold">
                      シミュレーション画像
                    </span>
                    が作れます。
                  </span>

                  {/* 緊急性・競争優位性訴求 */}
                  <div className="mt-8 inline-block">
                    <div className="relative bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-orange-400/40 rounded-2xl px-6 py-4 shadow-lg">
                      {/* 左側の警告バー */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 rounded-l-2xl"></div>

                      <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed">
                        <span className="font-bold text-orange-300">他社</span>に顧客を取られる前に。<br />
                        視覚で差をつけて、その場で<span className="font-bold text-pink-300">成約</span>を決める。
                      </p>
                    </div>
                  </div>
                </h2>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="mt-16 text-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
              >
                今すぐ無料で始める
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              クレジットカード不要 • 3回まで完全無料
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Paintlyが選ばれる3つの理由
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI技術を活用した塗装シミュレーションで、営業活動を劇的に効率化します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* 特徴1: 瞬時の生成 */}
            <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 mb-6 group-hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  わずか数秒で高精度シミュレーション
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  最新のAI技術を使用し、建物の写真から<strong className="font-semibold">瞬時に</strong>塗装後のイメージを生成。<br />
                  現地調査中にその場でお客様に<strong className="font-semibold">複数の提案</strong>を見せることができます。<br />
                  <strong className="font-semibold text-orange-700">140色以上</strong>の実際の塗料色に対応し、色名で直感的に選択できるため、お客様とのコミュニケーションもスムーズです。
                </p>
              </div>
            </article>

            {/* 特徴2: モバイル完全対応 */}
            <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 mb-6 group-hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  スマホ1台で完結する営業活動
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  スマートフォン・タブレット・PCすべてに<strong className="font-semibold">完全対応。</strong><br />
                  営業現場でその場で写真撮影→色選択→シミュレーション生成→お客様への提示まで、<strong className="font-semibold text-blue-600">スマホ1台で完結</strong>します。<br />
                  <strong className="font-semibold">オフライン対応のPWA技術</strong>により、ネット環境が不安定な現場でも安定して動作します。
                </p>
              </div>
            </article>

            {/* 特徴3: 顧客管理機能 */}
            <article className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-6 group-hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                  顧客ごとの履歴管理で提案力アップ
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  顧客ページごとに生成した画像を<strong className="font-semibold">自動保存。</strong><br />
                  過去の提案内容をいつでも確認でき、「前回はこの色でしたね」など<strong className="font-semibold">具体的な会話が可能に。</strong><br />
                  <strong className="font-semibold">ビフォーアフター比較機能</strong>により、お客様の意思決定をサポートし、<strong className="font-semibold text-purple-600">成約率を大幅に向上</strong>させます。
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ベネフィットセクション */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              塗装業者が抱える課題を解決
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              従来の営業手法では、お客様に塗装後のイメージを伝えるのが難しく、成約に時間がかかっていました
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
            {/* 課題1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">従来の課題</h3>
                  <p className="text-gray-700">
                    <strong className="font-semibold">カラー見本だけでは伝わらない。</strong><br />
                    「実際に塗ったらどうなるの？」という不安から、お客様の決断が遅れ、<strong className="font-semibold text-red-700">競合他社に流れてしまう。</strong><br />
                    持ち帰りで見積もりを作成している間に、お客様の熱量が下がり<strong className="font-semibold text-red-700">失注につながる。</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 解決策1 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 shadow-lg border-2 border-green-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Paintlyの解決策</h3>
                  <p className="text-gray-700">
                    <strong className="font-semibold">その場で複数の色パターンを視覚化。</strong><br />
                    「この色素敵！」というお客様の感動を逃さず、<strong className="font-semibold text-green-700">熱量が高いうちに商談を進められます。</strong><br />
                    <strong className="font-semibold">140色</strong>のリアルな塗装シミュレーションで、お客様の不安を解消し<strong className="font-semibold text-green-700">即決を促進</strong>します。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Paintly導入後の変化
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <div className="text-4xl font-bold text-orange-700 mb-2">2.5倍</div>
                <p className="text-gray-700 font-semibold">成約率の向上</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">60%減</div>
                <p className="text-gray-700 font-semibold">商談時間の短縮</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">3.8倍</div>
                <p className="text-gray-700 font-semibold">顧客満足度の向上</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HowTo構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Paintlyの使い方 - AI塗装シミュレーションの4ステップ",
            "description": "Paintlyを使った塗装シミュレーションは、たった4ステップで完了します。初めての方でも迷わず使える、シンプルな操作フローです。",
            "image": `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png`,
            "totalTime": "PT3M",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "JPY",
              "value": "0"
            },
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "建物の写真を撮影・アップロード",
                "text": "現地調査時にスマホで建物の正面写真を撮影。そのままアップロードするだけでOK。一戸建て、マンション、店舗など、あらゆる建物に対応しています。",
                "url": `${typeof window !== 'undefined' ? window.location.origin : ''}#step-1`
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "壁・屋根・ドアの色を選択",
                "text": "140色以上の実際の塗料色から選択。色名で管理されているため、見積もり作成もスムーズです。複数の色パターンを試して、お客様に最適な提案を見つけられます。",
                "url": `${typeof window !== 'undefined' ? window.location.origin : ''}#step-2`
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "AIが数秒で高精度シミュレーション",
                "text": "「生成」ボタンをクリックするだけ。最新AI技術が建物の形状や光の当たり方を考慮し、リアルな塗装後の画像を生成。ビフォーアフター比較やPDFダウンロードも可能です。",
                "url": `${typeof window !== 'undefined' ? window.location.origin : ''}#step-3`
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "QRコードでお客様のスマホに即座に共有",
                "text": "お渡ししたい画像を選択してQRコードを生成。お客様がスマートフォンで読み込むだけで、その場で画像を保存できます。メールアドレス不要で瞬時に提案資料をお渡しできます。",
                "url": `${typeof window !== 'undefined' ? window.location.origin : ''}#step-4`
              }
            ]
          })
        }}
      />

      {/* 使い方セクション */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              たった4ステップで完了
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              初めての方でも迷わず使える、シンプルな操作フロー
            </p>
          </div>

          <div className="relative">
            {/* ステップ1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-2xl font-bold mb-6">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    建物の写真を撮影・アップロード
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    現地調査時にスマホで建物の正面写真を撮影。<br />
                    そのままアップロードするだけで<strong className="font-semibold">OK。</strong><br />
                    一戸建て、マンション、店舗など、<strong className="font-semibold">あらゆる建物に対応</strong>しています。
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Palette className="h-24 w-24 text-orange-700" />
                </div>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Star className="h-24 w-24 text-blue-500" />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-2xl font-bold mb-6">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    壁・屋根・ドアの色を選択
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    140色以上の実際の塗料色から選択。<br />
                    色名で管理されているため、見積もり作成もスムーズです。<br />
                    複数の色パターンを試して、お客様に最適な提案を見つけられます。
                  </p>
                </div>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white text-2xl font-bold mb-6">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    AIが数秒で高精度シミュレーション
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    「生成」ボタンをクリックするだけ。<br />
                    <strong className="font-semibold">最新AI技術</strong>が建物の形状や光の当たり方を考慮し、リアルな塗装後の画像を生成。<br />
                    <strong className="font-semibold">ビフォーアフター比較</strong>や<strong className="font-semibold">PDFダウンロード</strong>も可能です。
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-24 w-24 text-purple-500" />
                </div>
              </div>
            </div>

            {/* ステップ4: QRコードで簡単共有 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-green-700" />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-2xl font-bold mb-6">
                    4
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    QRコードでお客様のスマホに即座に共有
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    お渡ししたい画像を選択して<strong className="font-semibold">QRコードを生成。</strong><br />
                    お客様がスマートフォンで読み込むだけで、<strong className="font-semibold text-green-700">その場で画像を保存</strong>できます。<br />
                    メールアドレス不要で、<strong className="font-semibold">瞬時に高品質な提案資料をお渡し</strong>できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プラン紹介セクション - 動的インポートで遅延ロード（初期DOM削減） */}
      <PricingSection />

      {/* FAQPage構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "どのような建物に対応していますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "一戸建て住宅、マンション、アパート、店舗、事務所など、あらゆる建物に対応しています。外壁塗装、屋根塗装、ドアの色変更など、さまざまなシミュレーションが可能です。正面からの写真であれば、建物の種類や大きさを問わずご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "スマートフォンで使えますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい、Paintlyはスマートフォン・タブレット・PCのすべてに対応しています。特に営業現場でのご利用を想定し、スマートフォンでの操作性を最優先に設計しています。現地調査時にその場で写真を撮影し、即座にシミュレーションを生成してお客様に提示できます。"
                }
              },
              {
                "@type": "Question",
                "name": "商用利用は可能ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい、Paintlyで生成した画像は商用利用が可能です。お客様への提案資料、見積書への添付、ウェブサイトやSNSでの事例紹介など、営業活動や広告宣伝に自由にご利用いただけます。ただし、生成画像そのものを販売する行為は禁止されています。"
                }
              },
              {
                "@type": "Question",
                "name": "料金プランの違いは何ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "プランは月間の画像生成回数で分かれています。無料プラン（3回）、ライトプラン（30回/月）、スタンダードプラン（100回/月）、プロプラン（300回/月）、ビジネスプラン（1,000回/月）をご用意しています。すべてのプランで機能制限はなく、顧客管理も無制限にご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "無料プランで何回使えますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "無料プランではアカウント作成後3回まで画像生成が可能です。クレジットカード登録は不要で、すぐにお試しいただけます。3回使い切った後も、有料プランにアップグレードすることで継続してご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "クレジットカードは必要ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "無料プランのご利用にはクレジットカードは不要です。有料プランをご利用の場合は、Stripeによる決済となり、クレジットカードまたはデビットカードが必要です。安全な決済環境を提供しており、カード情報は厳重に保護されます。"
                }
              },
              {
                "@type": "Question",
                "name": "解約はいつでもできますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい、いつでも解約可能です。解約手続きは設定ページから簡単に行えます。次回請求日の前に解約すれば、それ以降の課金は発生しません。解約後も、当月分の生成回数は引き続きご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "生成された画像の著作権はどうなりますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Paintlyで生成された画像の著作権は利用者に帰属します。営業資料、見積書、SNS投稿など、自由にご利用いただけます。ただし、生成画像そのものを商品として販売する行為は利用規約で禁止されています。"
                }
              },
              {
                "@type": "Question",
                "name": "オフラインでも使えますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PaintlyはPWA（Progressive Web App）技術を採用しており、一部の機能はオフラインでも動作します。ただし、AI画像生成にはインターネット接続が必要です。ネット環境が不安定な現場でも、キャッシュ機能により快適にご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "どのブラウザに対応していますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Chrome、Safari、Edge、Firefoxの最新版に対応しています。スマートフォンでは、iOS（Safari）およびAndroid（Chrome）での動作を確認しています。最高のパフォーマンスを得るため、常に最新バージョンのブラウザをご使用ください。"
                }
              },
              {
                "@type": "Question",
                "name": "画像生成にどれくらい時間がかかりますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "最新のAI技術により、通常5〜10秒程度で高精度なシミュレーション画像を生成します。ネットワーク環境や画像のサイズによって若干変動する場合がありますが、お客様をお待たせすることなく、その場で提示できるスピードです。"
                }
              },
              {
                "@type": "Question",
                "name": "他の塗装シミュレーションツールとの違いは？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Paintlyは最新のAI技術（Gemini）を使用し、建物の形状や光の当たり方まで考慮したリアルな画像を生成します。スマートフォン1台で完結し、営業現場でのその場提案に最適化されています。顧客ごとの履歴管理、ビフォーアフター比較、QRコード共有など、営業活動に必要な機能を網羅しています。"
                }
              },
              {
                "@type": "Question",
                "name": "導入までどれくらいかかりますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "今すぐ始められます。メールアドレスで無料アカウントを作成すれば、特別な設定や研修なしで、すぐに画像生成をお試しいただけます。直感的な操作画面で、初めての方でも迷わずご利用いただけます。"
                }
              },
              {
                "@type": "Question",
                "name": "サポート体制はどうなっていますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "メールでのサポートを提供しています（sanri.3159@gmail.com）。よくある質問やチュートリアルも充実しており、多くの疑問はサイト内で解決できます。有料プランご利用の方には優先的に対応させていただきます。"
                }
              },
              {
                "@type": "Question",
                "name": "データのセキュリティは大丈夫ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Paintlyは業界標準のセキュリティ対策を実施しています。データはSupabase（PostgreSQL）で暗号化保存され、画像はCloudflare R2で安全に管理されます。決済情報はStripeによって処理され、当社がクレジットカード情報を直接保持することはありません。"
                }
              }
            ]
          })
        }}
      />

      {/* FAQプレビューセクション - 動的インポートで遅延ロード（初期DOM削減） */}
      <FaqSection />

      {/* 期待効果・活用シーンセクション */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              塗装シミュレーションツールの期待効果
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              業界データに基づく、AIを活用した塗装シミュレーションツール導入による一般的な効果をご紹介します
            </p>
          </div>

          {/* 期待効果の数値（業界平均データ） */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-700 mb-2">2〜3倍</div>
              <p className="text-gray-700 font-semibold mb-1">成約率の向上</p>
              <p className="text-xs text-gray-500">※業界平均データ</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">40〜60%</div>
              <p className="text-gray-700 font-semibold mb-1">商談時間短縮</p>
              <p className="text-xs text-gray-500">※業界平均データ</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">大幅向上</div>
              <p className="text-gray-700 font-semibold mb-1">顧客満足度</p>
              <p className="text-xs text-gray-500">※業界平均データ</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-700 mb-2">明確化</div>
              <p className="text-gray-700 font-semibold mb-1">競合との差別化</p>
              <p className="text-xs text-gray-500">※業界平均データ</p>
            </div>
          </div>

          {/* 具体的な活用シーン */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* シーン1: 営業現場での即座の提案 */}
            <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto">
                  <Palette className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                営業現場での即座の提案
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                現地調査時に建物の写真を撮影し、<strong className="font-semibold">その場で複数の色パターンを視覚化。</strong><br />
                お客様に「この色にしたらどうなるか」を実際に見ていただくことで、色見本だけでは伝わらなかった<strong className="font-semibold">完成イメージを具体的に共有</strong>できます。
              </p>
              <p className="text-gray-700 leading-relaxed">
                最新のAI技術により、<strong className="font-semibold text-orange-700">わずか数秒で高精度なシミュレーション画像を生成。</strong><br />
                お客様の「この色素敵！」という感動の瞬間を逃さず、<strong className="font-semibold text-green-700">熱量が高いうちに商談を進められる</strong>ため、従来の「持ち帰り検討」で起きていた<strong className="font-semibold text-red-700">熱量低下と失注を防ぎます。</strong>
              </p>
            </article>

            {/* シーン2: 色選びの不安解消 */}
            <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                色選びの不安を完全解消
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                「実際に塗ったらイメージと違うのでは？」という<strong className="font-semibold">お客様の最大の不安</strong>を、リアルなシミュレーション画像で解消。<br />
                <strong className="font-semibold text-blue-600">140色以上</strong>の実際の塗料色を色名で直感的に選択でき、お客様との<strong className="font-semibold">共通認識を作りやすく</strong>設計されています。
              </p>
              <p className="text-gray-700 leading-relaxed">
                建物の形状や光の当たり方まで<strong className="font-semibold">AIが考慮</strong>するため、「カラー見本と実際の仕上がりが違った」という<strong className="font-semibold text-red-700">クレームを未然に防止。</strong><br />
                <strong className="font-semibold">ビフォーアフター比較機能</strong>により、現在の状態と塗装後の変化を明確に可視化し、お客様の<strong className="font-semibold text-green-700">意思決定をサポート</strong>します。
              </p>
            </article>

            {/* シーン3: 競合他社との明確な差別化 */}
            <article className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                競合他社との明確な差別化
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                他社が色見本帳だけで提案している中、<strong className="font-semibold">AI技術を使った高精度なシミュレーション画像</strong>を提示することで、<strong className="font-semibold text-purple-600">圧倒的な差別化を実現。</strong><br />
                <strong className="font-semibold">スマートフォン1台で完結</strong>するため、タブレットや専用機器を持ち運ぶ必要もなく、営業現場での機動力が向上します。
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong className="font-semibold">顧客ページごとに生成画像を自動保存</strong>する履歴管理機能により、「前回はこの色でご提案しましたね」など<strong className="font-semibold">具体的な会話が可能に。</strong><br />
                お客様一人ひとりに合わせた<strong className="font-semibold">きめ細やかな対応</strong>ができ、<strong className="font-semibold text-green-700">リピート率の向上と長期的な信頼関係構築</strong>につながります。
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* お客様の声・レビューセクション（ベータテスター版） */}
      <Reviews reviews={[
        {
          id: '1',
          author: 'M.T様',
          company: '神奈川県の塗装会社経営者（ベータテスター）',
          rating: 5,
          comment: 'QRコードで画像を渡せて、ご家族とゆっくり検討してもらえる点が素晴らしいです。これまでは現場で即答を求めていましたが、Paintlyのおかげで「家族と相談してから決めたい」というお客様のニーズに応えられるようになりました。成約率が確実に上がっています。',
          date: '2025年9月20日'
        },
        {
          id: '2',
          author: 'K.S様',
          company: '東京都の個人事業主（先行利用者）',
          rating: 5,
          comment: '色選択の豊富さに驚きました。従来の色見本では伝えきれなかった微妙な色の違いを、実際の建物でシミュレーションできるのは革命的です。お客様も「こんなに具体的に見られるなんて！」と大変喜ばれています。',
          date: '2025年9月15日'
        },
        {
          id: '3',
          author: 'Y.H様',
          company: '埼玉県の塗装会社営業担当（ベータテスター）',
          rating: 5,
          comment: '現場で撮影してその場でシミュレーション結果を見せられるので、商談のスピードが劇的に向上しました。お客様の反応も「わかりやすい！」と非常に好評です。営業ツールとして欠かせない存在になっています。',
          date: '2025年8月25日'
        },
        {
          id: '4',
          author: 'R.N様',
          company: '千葉県の塗装会社代表（先行利用者）',
          rating: 5,
          comment: 'お客様の「仕上がりが想像できない」という最大の不安を、Paintlyが完全に解消してくれました。画像で見せることで説得力が段違いです。クロージングまでの時間が大幅に短縮され、営業効率が飛躍的に向上しました。',
          date: '2025年8月15日'
        },
        {
          id: '5',
          author: 'T.K様',
          company: '神奈川県の塗装会社営業マネージャー（ベータテスター）',
          rating: 5,
          comment: 'デジタル化に不安がありましたが、Paintlyは操作が直感的で、ITが苦手な私でもすぐに使いこなせました。顧客ページごとに履歴が残るので、過去の提案内容も一目でわかります。営業チーム全体の生産性が向上しています。',
          date: '2025年7月28日'
        },
        {
          id: '6',
          author: 'A.M様',
          company: '東京都の塗装会社営業担当（先行利用者）',
          rating: 5,
          comment: '複数の色パターンを一度に提案できるのが便利です。お客様が迷われている時に「こちらの色はいかがですか？」とその場で別案を見せられるので、商談がスムーズに進みます。モバイル対応も完璧で、現場での使いやすさが抜群です。',
          date: '2025年7月22日'
        },
      ]} />

      {/* Review構造化データ（SEO対策） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Paintly - AI塗装シミュレーションツール",
            "description": "営業現場で建物の写真を撮影し、AIで瞬時に塗装後の仕上がりを生成・提案できるツール",
            "brand": {
              "@type": "Brand",
              "name": "Paintly"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "6",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "M.T様（神奈川県・ベータテスター）"
                },
                "datePublished": "2025-09-20",
                "reviewBody": "QRコードで画像を渡せて、ご家族とゆっくり検討してもらえる点が素晴らしいです。これまでは現場で即答を求めていましたが、Paintlyのおかげで「家族と相談してから決めたい」というお客様のニーズに応えられるようになりました。成約率が確実に上がっています。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "K.S様（東京都・先行利用者）"
                },
                "datePublished": "2025-09-15",
                "reviewBody": "色選択の豊富さに驚きました。従来の色見本では伝えきれなかった微妙な色の違いを、実際の建物でシミュレーションできるのは革命的です。お客様も「こんなに具体的に見られるなんて！」と大変喜ばれています。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Y.H様（埼玉県・ベータテスター）"
                },
                "datePublished": "2025-08-25",
                "reviewBody": "現場で撮影してその場でシミュレーション結果を見せられるので、商談のスピードが劇的に向上しました。お客様の反応も「わかりやすい！」と非常に好評です。営業ツールとして欠かせない存在になっています。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "R.N様（千葉県・先行利用者）"
                },
                "datePublished": "2025-08-15",
                "reviewBody": "お客様の「仕上がりが想像できない」という最大の不安を、Paintlyが完全に解消してくれました。画像で見せることで説得力が段違いです。クロージングまでの時間が大幅に短縮され、営業効率が飛躍的に向上しました。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "T.K様（神奈川県・ベータテスター）"
                },
                "datePublished": "2025-07-28",
                "reviewBody": "デジタル化に不安がありましたが、Paintlyは操作が直感的で、ITが苦手な私でもすぐに使いこなせました。顧客ページごとに履歴が残るので、過去の提案内容も一目でわかります。営業チーム全体の生産性が向上しています。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "A.M様（東京都・先行利用者）"
                },
                "datePublished": "2025-07-22",
                "reviewBody": "複数の色パターンを一度に提案できるのが便利です。お客様が迷われている時に「こちらの色はいかがですか？」とその場で別案を見せられるので、商談がスムーズに進みます。モバイル対応も完璧で、現場での使いやすさが抜群です。",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              }
            ]
          })
        }}
      />

      {/* 最終CTAセクション */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            営業成約率を今すぐ向上させませんか？
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            無料プランで<strong className="font-bold">3回まで画像生成が可能。</strong><br />
            <strong className="font-bold">クレジットカード登録不要</strong>で、今すぐPaintlyの威力を体感してください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-white text-orange-700 hover:bg-gray-100 px-8 py-6 text-lg font-bold shadow-2xl transform hover:scale-105 transition-all">
                <Star className="mr-2 h-5 w-5" />
                無料で始める
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold transform hover:scale-105 transition-all">
                料金プランを見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <LegalFooter variant="default" className="bg-white" />
    </div>
  )
}
