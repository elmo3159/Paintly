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
      '画像保存期間: 7日間',
      '基本サポート'
    ],
    generationLimit: 3,
    storageMonths: 0.25,
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
      '画像保存期間: 1ヶ月',
      'メールサポート'
    ],
    generationLimit: 30,
    storageMonths: 1,
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
      '画像保存期間: 3ヶ月',
      '優先サポート'
    ],
    generationLimit: 100,
    storageMonths: 3,
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
      '画像保存期間: 6ヶ月',
      '24時間サポート'
    ],
    generationLimit: 300,
    storageMonths: 6,
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
      '画像保存期間: 1年間',
      '専任サポート',
      '複数ユーザー対応'
    ],
    generationLimit: 1000,
    storageMonths: 12,
    description: '複数営業担当での利用に'
  }
]

export function getPlanById(planId: string): PricingPlan | undefined {
  return pricingPlans.find(plan => plan.id === planId)
}

export function getStripePriceId(planId: string): string | undefined {
  const plan = getPlanById(planId)
  return plan?.priceId
}