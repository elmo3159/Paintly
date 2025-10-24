import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://paintly.pro'

  // 主要ページの最終更新日を明示的に設定（SEO最適化）
  const mainPageDate = new Date('2025-01-20T00:00:00+09:00') // メイン機能の最終更新日
  const legalPageDate = new Date('2025-01-15T00:00:00+09:00') // 利用規約の最終更新日
  const blogPageDate = new Date('2025-01-24T00:00:00+09:00') // ブログの最終更新日

  // ブログ記事のスラッグリスト
  const blogPosts = [
    { slug: 'ai-simulation-case-study', date: '2024-11-20' },
    { slug: 'exterior-color-selection-guide', date: '2024-11-10' },
    { slug: 'digital-transformation-painting-business', date: '2024-10-28' },
    { slug: 'popular-exterior-colors-2024', date: '2024-10-15' },
    { slug: 'customer-anxiety-resolution', date: '2024-10-05' },
  ]

  return [
    {
      url: baseUrl,
      lastModified: mainPageDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: mainPageDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: mainPageDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: mainPageDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: mainPageDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: legalPageDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: legalPageDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: legalPageDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // ブログ一覧ページ
    {
      url: `${baseUrl}/blog`,
      lastModified: blogPageDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // ブログ記事ページ
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
