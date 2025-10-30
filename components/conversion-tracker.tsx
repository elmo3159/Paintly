'use client'

import { useEffect } from 'react'
import { ConversionEvents } from '@/lib/google-ads'

/**
 * コンバージョントラッキングコンポーネント
 *
 * 新規登録やその他の重要なイベントを自動的にトラッキングします
 */
export function ConversionTracker({ userId, createdAt }: { userId: string; createdAt: string }) {
  useEffect(() => {
    // 新規登録かどうかを判定（アカウント作成から5分以内）
    const accountAge = Date.now() - new Date(createdAt).getTime()
    const isNewUser = accountAge < 5 * 60 * 1000 // 5分以内

    // 既にトラッキング済みかチェック
    const trackedKey = `conversion_tracked_signup_${userId}`
    const alreadyTracked = localStorage.getItem(trackedKey)

    if (isNewUser && !alreadyTracked) {
      // 新規登録コンバージョンをトラッキング
      ConversionEvents.signUp()

      // トラッキング済みフラグを保存
      localStorage.setItem(trackedKey, 'true')

      console.log('✅ New user signup conversion tracked')
    }
  }, [userId, createdAt])

  return null
}
