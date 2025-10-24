import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import { Breadcrumb } from '@/components/breadcrumb'

export const metadata: Metadata = {
  title: 'ブログ｜Paintly - 塗装業界のデジタル化情報',
  description: 'AI塗装シミュレーション、営業効率化、業界トレンドなど、塗装ビジネスに役立つ情報を発信しています。',
  openGraph: {
    title: 'ブログ｜Paintly - 塗装業界のデジタル化情報',
    description: 'AI塗装シミュレーション、営業効率化、業界トレンドなど、塗装ビジネスに役立つ情報を発信しています。',
    type: 'website',
  },
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: string
  author: {
    name: string
    role: string
  }
  coverImage?: string
}

// ブログ記事データ（将来的にはCMSやデータベースから取得）
const blogPosts: BlogPost[] = [
  {
    slug: 'ai-simulation-case-study',
    title: 'AI塗装シミュレーションで成約率が2倍に！導入事例を徹底解説',
    excerpt: '神奈川県の塗装会社がPaintlyを導入し、わずか3ヶ月で成約率が2倍に向上した事例を詳しく紹介します。具体的な活用方法と成功のポイントを解説。',
    content: '',
    category: '導入事例',
    tags: ['AI', '成約率', '導入事例', 'デジタル化'],
    publishedAt: '2024年11月20日',
    readingTime: '5分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
  {
    slug: 'exterior-color-selection-guide',
    title: '外壁塗装の色選びで失敗しない方法｜プロが教える3つのコツ',
    excerpt: 'お客様が後悔しない色選びをサポートするために、塗装のプロが実践している3つのコツを紹介します。カラーシミュレーションの効果的な活用法も解説。',
    content: '',
    category: '営業ノウハウ',
    tags: ['色選び', '提案力', 'カラーシミュレーション'],
    publishedAt: '2024年11月10日',
    readingTime: '4分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
  {
    slug: 'digital-transformation-painting-business',
    title: '塗装営業の効率化術｜デジタルツールで変わる現場の働き方',
    excerpt: '従来の営業スタイルからデジタル化への移行で、商談時間が60%短縮した塗装会社の事例を紹介。現場で使えるツール活用術を解説します。',
    content: '',
    category: '業務効率化',
    tags: ['DX', '効率化', 'ツール活用', '働き方改革'],
    publishedAt: '2024年10月28日',
    readingTime: '6分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
  {
    slug: 'popular-exterior-colors-2024',
    title: '人気の外壁色トップ10｜2024年最新トレンドを紹介',
    excerpt: '2024年に最も選ばれている外壁色をランキング形式で紹介。トレンドカラーの特徴と、お客様への提案ポイントを詳しく解説します。',
    content: '',
    category: '業界トレンド',
    tags: ['トレンド', '外壁色', 'カラー提案', '2024年'],
    publishedAt: '2024年10月15日',
    readingTime: '5分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
  {
    slug: 'customer-anxiety-resolution',
    title: 'お客様の不安を解消する提案方法｜塗装営業の成功事例',
    excerpt: '「仕上がりが想像できない」「色選びで失敗したくない」というお客様の不安を解消し、信頼関係を築く提案方法を、成功事例とともに紹介します。',
    content: '',
    category: '営業ノウハウ',
    tags: ['顧客対応', '提案力', '信頼構築', '不安解消'],
    publishedAt: '2024年10月5日',
    readingTime: '4分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Paintly</span>
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
              ← トップページに戻る
            </Link>
          </div>
        </div>
      </header>

      {/* パンくずリスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'ブログ', href: '/blog' }]} />
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Paintlyブログ
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI塗装シミュレーション、営業効率化、業界トレンドなど、<br className="hidden md:block" />
            塗装ビジネスに役立つ情報を発信しています
          </p>
        </div>

        {/* カテゴリーフィルター */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <button className="px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-semibold hover:bg-orange-700 transition-colors">
            すべて
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
            導入事例
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
            営業ノウハウ
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
            業務効率化
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
            業界トレンド
          </button>
        </div>

        {/* ブログ記事一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden group"
            >
              {/* サムネイル */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-sm font-semibold text-orange-600 mb-2">
                      {post.category}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {post.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="p-6">
                {/* カテゴリーバッジ */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold">
                    <Tag className="h-3 w-3" />
                    {post.category}
                  </span>
                </div>

                {/* タイトル */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h2>

                {/* 抜粋 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* メタ情報 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>

                {/* 続きを読むリンク */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:gap-3 transition-all"
                >
                  続きを読む
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ページネーション（将来的に実装） */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">全{blogPosts.length}件の記事</p>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Paintly. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Blog構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Paintlyブログ",
            "description": "AI塗装シミュレーション、営業効率化、業界トレンドなど、塗装ビジネスに役立つ情報を発信しています。",
            "url": typeof window !== 'undefined' ? `${window.location.origin}/blog` : '/blog',
            "publisher": {
              "@type": "Organization",
              "name": "Paintly",
              "logo": {
                "@type": "ImageObject",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png'
              }
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "datePublished": post.publishedAt,
              "author": {
                "@type": "Person",
                "name": post.author.name
              },
              "url": typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : `/blog/${post.slug}`
            }))
          })
        }}
      />
    </div>
  )
}
