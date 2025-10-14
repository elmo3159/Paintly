/**
 * カラーヒストリー管理ユーティリティ
 * Supabaseデータベースを使用してユーザーごとに最近使用した色を保存・取得
 */

import { createClient } from '@/lib/supabase/client'

const MAX_HISTORY_SIZE = 10

/**
 * 色履歴に新しい色を追加
 * @param colorId - Web色のID
 * @returns 更新された色履歴配列
 */
export async function addToColorHistory(colorId: string): Promise<string[]> {
  // 'no-change'は履歴に追加しない
  if (colorId === 'no-change') {
    return getColorHistory()
  }

  const supabase = createClient()

  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, cannot save color history')
      return []
    }

    // 同じ色が既にある場合は削除（created_atを更新するため）
    await supabase
      .from('color_history')
      .delete()
      .eq('user_id', user.id)
      .eq('color_id', colorId)

    // 新しい色を追加
    const { error: insertError } = await supabase
      .from('color_history')
      .insert({
        user_id: user.id,
        color_id: colorId
      })

    if (insertError) {
      console.error('Failed to save color to history:', insertError)
      return getColorHistory()
    }

    // 履歴が上限を超えている場合、古いものを削除
    const { data: allHistory } = await supabase
      .from('color_history')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (allHistory && allHistory.length > MAX_HISTORY_SIZE) {
      const idsToDelete = allHistory.slice(MAX_HISTORY_SIZE).map(h => h.id)
      await supabase
        .from('color_history')
        .delete()
        .in('id', idsToDelete)
    }

    // 更新された履歴を返す
    return getColorHistory()
  } catch (error) {
    console.error('Failed to add color to history:', error)
    return []
  }
}

/**
 * 色履歴を取得
 * @returns 色ID配列（最新順）
 */
export async function getColorHistory(): Promise<string[]> {
  const supabase = createClient()

  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return []
    }

    // ユーザーの色履歴を取得（最新順、上限10件）
    const { data, error } = await supabase
      .from('color_history')
      .select('color_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_SIZE)

    if (error) {
      console.error('Failed to load color history:', error)
      return []
    }

    return data?.map(h => h.color_id) || []
  } catch (error) {
    console.error('Failed to fetch color history:', error)
    return []
  }
}

/**
 * 色履歴をクリア
 */
export async function clearColorHistory(): Promise<void> {
  const supabase = createClient()

  try {
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, cannot clear color history')
      return
    }

    // ユーザーの色履歴を全削除
    const { error } = await supabase
      .from('color_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to clear color history:', error)
    }
  } catch (error) {
    console.error('Failed to clear color history:', error)
  }
}
