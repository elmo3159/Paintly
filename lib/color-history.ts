/**
 * カラーヒストリー管理ユーティリティ
 * LocalStorageを使用して最近使用した色を保存・取得
 */

const COLOR_HISTORY_KEY = 'paintly_recent_colors'
const MAX_HISTORY_SIZE = 10

/**
 * 色履歴に新しい色を追加
 * @param colorId - Web色のID
 * @returns 更新された色履歴配列
 */
export function addToColorHistory(colorId: string): string[] {
  // 'no-change'は履歴に追加しない
  if (colorId === 'no-change') {
    return getColorHistory()
  }

  const history = getColorHistory()
  // 同じ色が既に履歴にある場合は削除して最前面に移動
  const filtered = history.filter(c => c !== colorId)
  const updated = [colorId, ...filtered].slice(0, MAX_HISTORY_SIZE)

  try {
    localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save color history:', error)
  }

  return updated
}

/**
 * 色履歴を取得
 * @returns 色ID配列（最新順）
 */
export function getColorHistory(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(COLOR_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load color history:', error)
    return []
  }
}

/**
 * 色履歴をクリア
 */
export function clearColorHistory(): void {
  try {
    localStorage.removeItem(COLOR_HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear color history:', error)
  }
}
