/**
 * Google Ads コンバージョントラッキング用ユーティリティ
 *
 * 使用例：
 * - 会員登録完了時: trackConversion('sign_up')
 * - 有料プラン購入時: trackConversion('purchase', { value: 2980, currency: 'JPY' })
 * - 画像生成完了時: trackConversion('generate_image')
 */

// gtagのグローバル型定義
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

const GA_TRACKING_ID = 'AW-17664021447'

/**
 * Google Adsコンバージョンイベントを送信
 */
export function trackConversion(
  eventName: string,
  params?: {
    value?: number
    currency?: string
    transaction_id?: string
    [key: string]: any
  }
) {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Ads tracking not available')
    return
  }

  try {
    window.gtag('event', eventName, {
      send_to: GA_TRACKING_ID,
      ...params,
    })

    console.log(`✅ Google Ads conversion tracked: ${eventName}`, params)
  } catch (error) {
    console.error('Failed to track Google Ads conversion:', error)
  }
}

/**
 * 定義済みコンバージョンイベント
 */
export const ConversionEvents = {
  /**
   * 会員登録完了
   */
  signUp: () => {
    trackConversion('sign_up', {
      event_category: 'engagement',
      event_label: 'User Registration',
    })
  },

  /**
   * 有料プラン購入
   */
  purchase: (params: {
    planName: string
    value: number
    transactionId?: string
  }) => {
    trackConversion('purchase', {
      value: params.value,
      currency: 'JPY',
      transaction_id: params.transactionId,
      event_category: 'ecommerce',
      event_label: params.planName,
      items: [
        {
          item_name: params.planName,
          price: params.value,
          quantity: 1,
        },
      ],
    })
  },

  /**
   * 画像生成完了
   */
  generateImage: () => {
    trackConversion('generate_image', {
      event_category: 'engagement',
      event_label: 'Image Generation',
    })
  },

  /**
   * 顧客ページ作成
   */
  createCustomer: () => {
    trackConversion('create_customer', {
      event_category: 'engagement',
      event_label: 'Customer Page Created',
    })
  },

  /**
   * 無料トライアル開始
   */
  startTrial: () => {
    trackConversion('start_trial', {
      event_category: 'engagement',
      event_label: 'Free Trial Started',
    })
  },

  /**
   * プラン変更（アップグレード）
   */
  upgradePlan: (params: { fromPlan: string; toPlan: string; value: number }) => {
    trackConversion('upgrade', {
      value: params.value,
      currency: 'JPY',
      event_category: 'ecommerce',
      event_label: `${params.fromPlan} → ${params.toPlan}`,
    })
  },

  /**
   * ページビュー（特定の重要ページ）
   */
  pageView: (pageName: string) => {
    trackConversion('page_view', {
      page_title: pageName,
      page_location: window.location.href,
      event_category: 'engagement',
    })
  },

  /**
   * お問い合わせフォーム送信
   */
  contactSubmit: () => {
    trackConversion('contact', {
      event_category: 'engagement',
      event_label: 'Contact Form Submit',
    })
  },

  /**
   * 画像ダウンロード
   */
  downloadImage: () => {
    trackConversion('download', {
      event_category: 'engagement',
      event_label: 'Image Download',
    })
  },
} as const

/**
 * Google Ads リマーケティングタグ設定
 */
export function setRemarketingTag(params: {
  userId?: string
  userType?: 'free' | 'paid'
  planName?: string
}) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  try {
    window.gtag('set', GA_TRACKING_ID, {
      user_id: params.userId,
      user_type: params.userType,
      plan_name: params.planName,
    })
  } catch (error) {
    console.error('Failed to set remarketing tag:', error)
  }
}
