import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://paintly.pro'

  // 主要ページの最終更新日を明示的に設定（SEO最適化）
  const mainPageDate = new Date('2025-01-20T00:00:00+09:00') // メイン機能の最終更新日
  const legalPageDate = new Date('2025-01-15T00:00:00+09:00') // 利用規約の最終更新日

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
  ]
}
