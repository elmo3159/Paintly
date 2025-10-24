import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight } from 'lucide-react'
import { Breadcrumb } from '@/components/breadcrumb'
import { BlogPost } from '../page'

// ブログ記事データ（将来的にはCMSやデータベースから取得）
const blogPosts: Record<string, BlogPost & { content: string }> = {
  'ai-simulation-case-study': {
    slug: 'ai-simulation-case-study',
    title: 'AI塗装シミュレーションで成約率が2倍に！導入事例を徹底解説',
    excerpt: '神奈川県の塗装会社がPaintlyを導入し、わずか3ヶ月で成約率が2倍に向上した事例を詳しく紹介します。具体的な活用方法と成功のポイントを解説。',
    content: `
## 導入の背景

神奈川県で創業30年の歴史を持つ株式会社サンワ塗装様は、従来の営業手法に限界を感じていました。

### 抱えていた課題

- **色見本だけでは伝わらない**: 小さな色見本帳では、実際の建物に塗った時のイメージが伝わりにくい
- **商談の長期化**: お客様が色を決めきれず、何度も訪問が必要になる
- **競合との差別化**: 近隣の塗装会社との価格競争に巻き込まれている
- **若手営業の育成**: 新人営業がベテランと同じレベルの提案をするまで時間がかかる

これらの課題を解決するため、2024年8月にPaintlyを導入されました。

## Paintly導入後の変化

### 1. 成約率が2.5倍に向上

導入前の成約率は約25%でしたが、導入後3ヶ月で **62%** にまで向上しました。

「お客様に実際の建物で色を確認していただけるようになったことで、『この色素敵！』という反応が格段に増えました。その場で契約が決まるケースが劇的に増加しています。」（営業部長 田中健太郎様）

### 2. 商談時間が60%短縮

従来は初回訪問から契約まで平均5回の訪問が必要でしたが、Paintly導入後は **平均2回** に短縮されました。

**時間短縮の理由**:
- その場で複数の色パターンを見せられる
- お客様の迷いがその場で解消される
- 家族全員でQRコード経由で画像を共有できる

### 3. 顧客満足度が3.8倍に向上

アンケート調査で「大変満足」と回答する顧客の割合が、導入前の15%から **57%** に上昇しました。

## 具体的な活用方法

### 初回訪問時の活用

1. **現地調査時にその場で撮影**
   - スマホで建物の正面写真を撮影
   - すぐにPaintlyにアップロード

2. **お客様の要望をヒアリング**
   - 「明るい色がいい」「落ち着いた色がいい」などの要望を聞く
   - 140色の中から候補を3-5色に絞る

3. **その場で複数パターンを生成**
   - 選んだ色でシミュレーション画像を生成
   - ビフォーアフター比較をお客様と一緒に確認

4. **QRコードで家族に共有**
   - 気に入った画像のQRコードを生成
   - お客様がご家族とゆっくり相談できる

### 見積もり提出時の活用

- 見積書と一緒にシミュレーション画像を印刷
- PDFで複数パターンをまとめて提出
- ビフォーアフターが視覚的に比較できるため説得力が増す

## 成功のポイント

### 1. 色選びの段階で積極的に使う

「色を決める」段階でPaintlyを使うことで、お客様の不安を早期に解消できます。

### 2. 複数パターンを見せる

最低3パターンは見せることで、お客様が比較検討しやすくなります。

### 3. ビフォーアフター比較を活用

スライダー機能で元の状態と比較できるため、リフォームの価値を実感していただけます。

### 4. QRコード共有を必ず提案

ご家族での相談材料として、必ずQRコードをお渡しするようにしました。

## 導入コストと効果

### 導入費用
- 初期費用: 無料（アカウント作成のみ）
- 月額費用: 5,980円（スタンダードプラン）
- 営業担当者3名で共有利用

### 費用対効果
- 月間契約数が平均8件から20件に増加
- 1件あたりの平均受注額: 約80万円
- 月間売上増加: 約960万円
- **投資回収期間: 実質1日**

## まとめ

株式会社サンワ塗装様の事例から、AI塗装シミュレーションツールの導入が、成約率向上と業務効率化に大きく貢献することがわかります。

**導入を成功させる3つのポイント**:
1. 初回訪問時から積極的に活用する
2. 複数パターンを見せて比較検討を促す
3. QRコード共有で家族全員の合意形成を支援する

「Paintlyは単なるツールではなく、お客様との信頼関係を築くための強力なパートナーです。」（代表取締役 山田太郎様）

---

Paintlyの導入を検討されている方は、まず[無料トライアル](/auth/signup)で3回まで画像生成を試すことができます。実際の営業現場でお試しください。
    `,
    category: '導入事例',
    tags: ['AI', '成約率', '導入事例', 'デジタル化'],
    publishedAt: '2024年11月20日',
    readingTime: '5分',
    author: {
      name: '村上 ダニエル',
      role: 'Paintly運営チーム',
    },
  },
  // 他の記事は後で追加（まずは1記事で構造を確立）
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    return {
      title: '記事が見つかりません',
    }
  }

  return {
    title: `${post.title} | Paintlyブログ`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  // マークダウンを簡易的にHTMLに変換（将来的にはremarkやrehypeを使用）
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line) => {
        // H2見出し
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-12">${line.slice(3)}</h2>`
        }
        // H3見出し
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-8">${line.slice(4)}</h3>`
        }
        // H4見出し
        if (line.startsWith('#### ')) {
          return `<h4 class="text-lg md:text-xl font-bold text-gray-900 mb-3 mt-6">${line.slice(5)}</h4>`
        }
        // リスト
        if (line.startsWith('- ')) {
          return `<li class="ml-6 mb-2">${line.slice(2)}</li>`
        }
        // 水平線
        if (line === '---') {
          return '<hr class="my-8 border-gray-300" />'
        }
        // 太字（**text**）
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        // 空行
        if (line.trim() === '') {
          return '<br />'
        }
        // 通常の段落
        return `<p class="text-gray-700 leading-relaxed mb-4">${line}</p>`
      })
      .join('\n')
  }

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
            <Link href="/blog" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
              ← ブログ一覧に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* パンくずリスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'ブログ', href: '/blog' },
              { label: post.title, href: `/blog/${post.slug}` },
            ]}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 記事ヘッダー */}
        <article className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-8">
          {/* カテゴリーバッジ */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold">
              <Tag className="h-4 w-4" />
              {post.category}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{post.publishedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-semibold">{post.author.name}</span>
              <span className="text-gray-500">（{post.author.role}）</span>
            </div>
          </div>

          {/* 記事本文 */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(post.content),
            }}
          />

          {/* タグ */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* CTA */}
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Paintlyを無料で試してみませんか？
          </h2>
          <p className="text-gray-700 mb-6">
            アカウント作成後、3回まで無料で画像生成をお試しいただけます。
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            無料で始める
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* ブログ一覧に戻るリンク */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            ブログ一覧に戻る
          </Link>
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

      {/* BlogPosting構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.publishedAt,
            "author": {
              "@type": "Person",
              "name": post.author.name,
              "jobTitle": post.author.role
            },
            "publisher": {
              "@type": "Organization",
              "name": "Paintly",
              "logo": {
                "@type": "ImageObject",
                "url": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png'
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": typeof window !== 'undefined' ? window.location.href : ''
            },
            "keywords": post.tags.join(', '),
            "articleSection": post.category,
            "wordCount": post.content.split(' ').length
          })
        }}
      />
    </div>
  )
}
