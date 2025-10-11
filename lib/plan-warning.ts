/**
 * プラン上限警告ユーティリティ
 * 残り生成回数に基づいて警告レベルを判定
 */

export type WarningLevel = 'safe' | 'warning' | 'critical' | 'exceeded'

export interface PlanWarningInfo {
  level: WarningLevel
  message: string
  color: string // プログレスバーの色
  showUpgrade: boolean // アップグレードボタンを表示するか
}

/**
 * 残り回数から警告レベルを判定
 */
export function getPlanWarningLevel(
  remaining: number,
  limit: number
): PlanWarningInfo {
  // 上限達成（残り0回）
  if (remaining <= 0) {
    return {
      level: 'exceeded',
      message: '生成回数の上限に達しました',
      color: 'bg-red-500',
      showUpgrade: true
    }
  }

  // 残り1回
  if (remaining === 1) {
    return {
      level: 'critical',
      message: `あと${remaining}回で上限です`,
      color: 'bg-orange-500',
      showUpgrade: true
    }
  }

  // 残り3回以下
  if (remaining <= 3) {
    return {
      level: 'warning',
      message: `残り${remaining}回です`,
      color: 'bg-yellow-500',
      showUpgrade: false
    }
  }

  // 使用率80%以上
  const usageRate = ((limit - remaining) / limit) * 100
  if (usageRate >= 80) {
    return {
      level: 'warning',
      message: `残り${remaining}回です`,
      color: 'bg-yellow-500',
      showUpgrade: false
    }
  }

  // 安全圏
  return {
    level: 'safe',
    message: '',
    color: 'bg-primary',
    showUpgrade: false
  }
}

/**
 * 画像生成が可能かチェック
 */
export function canGenerate(remaining: number): boolean {
  return remaining > 0
}

/**
 * 上限警告メッセージを取得（画像生成ボタンクリック時用）
 */
export function getGenerationBlockedMessage(planName: string): string {
  return `生成回数の上限に達しました。\n${planName}では画像生成ができません。\nプランをアップグレードしてください。`
}
