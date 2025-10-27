export interface PricingPlan {
  id: string
  name: string
  price: number
  priceId?: string // Stripe Price ID
  features: string[]
  generationLimit: number
  storageMonths: number
  highlighted?: boolean
  description: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    features: [
      '生成回数: 3回まで',
      '顧客ページ: 3件まで',
      '画像保存期間: 無期限'
    ],
    generationLimit: 3,
    storageMonths: 9999,
    description: 'お試し利用に最適'
  },
  {
    id: 'light',
    name: 'ライトプラン',
    price: 2980,
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIGHT_PRICE_ID,
    features: [
      '生成回数: 30回/月',
      '顧客ページ: 無制限',
      '画像保存期間: 無期限'
    ],
    generationLimit: 30,
    storageMonths: 9999,
    description: '週1-2件の営業活動に'
  },
  {
    id: 'standard',
    name: 'スタンダードプラン',
    price: 5980,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID,
    features: [
      '生成回数: 100回/月',
      '顧客ページ: 無制限',
      '画像保存期間: 無期限'
    ],
    generationLimit: 100,
    storageMonths: 9999,
    highlighted: true,
    description: '週3-5件の営業活動に'
  },
  {
    id: 'pro',
    name: 'プロプラン',
    price: 9980,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      '生成回数: 300回/月',
      '顧客ページ: 無制限',
      '画像保存期間: 無期限'
    ],
    generationLimit: 300,
    storageMonths: 9999,
    description: '毎日の営業活動に'
  },
  {
    id: 'business',
    name: 'ビジネスプラン',
    price: 19800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
    features: [
      '生成回数: 1,000回/月',
      '顧客ページ: 無制限',
      '画像保存期間: 無期限'
    ],
    generationLimit: 1000,
    storageMonths: 9999,
    description: '大量の営業活動に'
  }
]

export function getPlanById(planId: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === planId)
}

export function getStripePriceId(planId: string): string | undefined {
  const plan = getPlanById(planId)
  return plan?.priceId
}