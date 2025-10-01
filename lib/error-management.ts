/**
 * Paintly - エラー管理ユーティリティ
 * 高度なエラーハンドリング、ロギング、自動リトライ機能
 */

import { type ErrorType } from '@/components/enhanced-error'

// エラーログのインターフェース
interface ErrorLog {
  id: string
  timestamp: string
  errorType: ErrorType
  message: string
  userAgent: string
  url: string
  userId?: string
  stackTrace?: string
  retryCount: number
}

// 自動リトライ設定
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryableErrors: ErrorType[]
}

// デフォルト設定
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  retryableErrors: ['network', 'api', 'processing']
}

// エラーロギングクラス
class ErrorLogger {
  private logs: ErrorLog[] = []
  private readonly maxLogs = 100

  /**
   * エラーログを記録
   */
  log(
    error: Error | string,
    errorType: ErrorType,
    context?: {
      userId?: string
      url?: string
      retryCount?: number
    }
  ): void {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      errorType,
      message: typeof error === 'string' ? error : error.message,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : 'Unknown'),
      userId: context?.userId,
      stackTrace: typeof error === 'object' ? error.stack : undefined,
      retryCount: context?.retryCount || 0
    }

    this.logs.unshift(errorLog)

    // ログ数制限
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // コンソールに出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorLogger] ${errorType.toUpperCase()}:`, {
        message: errorLog.message,
        context,
        stack: errorLog.stackTrace
      })
    }

    // 重要なエラーは即座にレポート
    if (errorType === 'auth' || errorType === 'api') {
      this.reportCriticalError(errorLog)
    }
  }

  /**
   * クリティカルエラーを即座にレポート
   */
  private reportCriticalError(errorLog: ErrorLog): void {
    // 将来的にエラー報告サービス（Sentry等）に送信
    console.warn('[ErrorLogger] Critical error detected:', errorLog)
  }

  /**
   * 全ログを取得
   */
  getAllLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * 特定の期間のログを取得
   */
  getLogsByTimeRange(startTime: Date, endTime: Date): ErrorLog[] {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= startTime && logTime <= endTime
    })
  }

  /**
   * エラータイプ別ログを取得
   */
  getLogsByType(errorType: ErrorType): ErrorLog[] {
    return this.logs.filter(log => log.errorType === errorType)
  }

  /**
   * ログをクリア
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * ログをエクスポート（サポート用）
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// 自動リトライクラス
class RetryManager {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * 指数バックオフで関数を実行
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    errorType: ErrorType,
    context?: { userId?: string }
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await fn()

        // 成功時はリトライカウントをリセット
        if (attempt > 0) {
          errorLogger.log(
            `Retry successful after ${attempt} attempts`,
            errorType,
            { ...context, retryCount: attempt }
          )
        }

        return result
      } catch (error) {
        lastError = error as Error

        // リトライ可能でない場合は即座に失敗
        if (!this.config.retryableErrors.includes(errorType)) {
          errorLogger.log(lastError, errorType, { ...context, retryCount: attempt })
          throw lastError
        }

        // 最後の試行の場合は失敗
        if (attempt === this.config.maxRetries) {
          errorLogger.log(lastError, errorType, { ...context, retryCount: attempt })
          throw lastError
        }

        // 指数バックオフでの待機
        const delay = Math.min(
          this.config.baseDelay * Math.pow(2, attempt),
          this.config.maxDelay
        )

        errorLogger.log(
          `Retrying in ${delay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`,
          errorType,
          { ...context, retryCount: attempt }
        )

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // ここには到達しないはずだが、型安全性のため
    throw lastError!
  }

  /**
   * ネットワーク接続チェック
   */
  async checkNetworkConnection(): Promise<boolean> {
    if (typeof window === 'undefined') return true

    try {
      // オンライン状態をチェック
      if (!navigator.onLine) {
        return false
      }

      // 実際の接続テスト（小さなリクエスト）
      await fetch('/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors'
      })

      return true
    } catch {
      return false
    }
  }
}

// オフライン対応クラス
class OfflineManager {
  private isOnline = true
  private retryQueue: Array<() => Promise<unknown>> = []

  constructor() {
    if (typeof window !== 'undefined') {
      // オンライン/オフライン状態の監視
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
      this.isOnline = navigator.onLine
    }
  }

  /**
   * オンライン復帰時の処理
   */
  private async handleOnline(): Promise<void> {
    this.isOnline = true
    errorLogger.log('Network connection restored', 'network')

    // 待機中のリクエストを順次実行
    const queuedRequests = [...this.retryQueue]
    this.retryQueue = []

    for (const request of queuedRequests) {
      try {
        await request()
      } catch (error) {
        errorLogger.log(error as Error, 'network')
      }
    }
  }

  /**
   * オフライン時の処理
   */
  private handleOffline(): void {
    this.isOnline = false
    errorLogger.log('Network connection lost', 'network')
  }

  /**
   * リクエストをキューに追加（オフライン時）
   */
  queueRequest(request: () => Promise<any>): void {
    this.retryQueue.push(request)
  }

  /**
   * オンライン状態を取得
   */
  getOnlineStatus(): boolean {
    return this.isOnline
  }
}

// シングルトンインスタンス
export const errorLogger = new ErrorLogger()
export const retryManager = new RetryManager()
export const offlineManager = new OfflineManager()

// ユーティリティ関数
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorType: ErrorType,
  options?: {
    retry?: boolean
    userId?: string
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      if (options?.retry) {
        return await retryManager.executeWithRetry(
          () => fn(...args),
          errorType,
          { userId: options.userId }
        )
      } else {
        return await fn(...args)
      }
    } catch (error) {
      errorLogger.log(error as Error, errorType, { userId: options?.userId })
      throw error
    }
  }
}

/**
 * グローバルエラーハンドラーの設定
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return

  // 未処理のエラーをキャッチ
  window.addEventListener('error', (event) => {
    errorLogger.log(event.error || event.message, 'unknown')
  })

  // 未処理のPromise拒否をキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(
      event.reason instanceof Error ? event.reason : String(event.reason),
      'unknown'
    )
  })
}

// エラー統計情報
export function getErrorStats(): {
  totalErrors: number
  errorsByType: Record<ErrorType, number>
  recentErrors: number
} {
  const logs = errorLogger.getAllLogs()
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentLogs = errorLogger.getLogsByTimeRange(last24Hours, new Date())

  const errorsByType: Record<ErrorType, number> = {
    network: 0,
    validation: 0,
    api: 0,
    auth: 0,
    quota: 0,
    upload: 0,
    processing: 0,
    unknown: 0
  }

  logs.forEach(log => {
    errorsByType[log.errorType]++
  })

  return {
    totalErrors: logs.length,
    errorsByType,
    recentErrors: recentLogs.length
  }
}