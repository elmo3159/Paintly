/**
 * 拡張エラートラッキングシステム
 * クライアントサイドエラーの包括的な収集・分析・レポート機能
 */

// エラータイプの定義
export type ErrorType =
  | 'javascript'
  | 'promise'
  | 'resource'
  | 'api'
  | 'auth'
  | 'critical'
  | 'network'
  | 'performance'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorContext {
  componentName?: string
  actionType?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  timestamp?: string
  viewport?: {
    width: number
    height: number
  }
  performance?: {
    loadTime: number
    domContentLoaded: number
    memoryUsage?: {
      used: number
      total: number
      limit: number
    }
  }
  customData?: Record<string, any>
}

export interface ErrorReport {
  id: string
  errorType: ErrorType
  severity: ErrorSeverity
  message: string
  stackTrace?: string
  context: ErrorContext
  retryCount: number
  timestamp: string
}

class ErrorTracker {
  private static instance: ErrorTracker | null = null
  private isInitialized = false
  private errorQueue: ErrorReport[] = []
  private retryAttempts: Map<string, number> = new Map()
  private sessionId: string
  private isOnline = true
  private reportingEnabled = true

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandlers()
    this.setupNetworkMonitoring()
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  /**
   * エラートラッカーの初期化
   */
  public initialize(config?: {
    reportingEnabled?: boolean
    customSessionId?: string
  }): void {
    if (this.isInitialized) {
      console.warn('🟡 Error tracker already initialized')
      return
    }

    this.reportingEnabled = config?.reportingEnabled ?? true
    if (config?.customSessionId) {
      this.sessionId = config.customSessionId
    }

    console.log('✅ Error tracker initialized:', {
      sessionId: this.sessionId,
      reportingEnabled: this.reportingEnabled
    })

    this.isInitialized = true

    // キューにたまっているエラーを処理
    this.processErrorQueue()
  }

  /**
   * セッションIDの生成
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * グローバルエラーハンドラーの設定
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return

    // JavaScript エラーのキャッチ
    window.addEventListener('error', (event) => {
      this.captureError({
        error: event.error || new Error(event.message),
        errorType: 'javascript',
        context: {
          componentName: 'GlobalErrorHandler',
          actionType: 'javascript_error',
          customData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      })
    })

    // Promise rejection のキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        errorType: 'promise',
        context: {
          componentName: 'GlobalErrorHandler',
          actionType: 'unhandled_promise_rejection'
        }
      })
    })

    // リソース読み込みエラーのキャッチ
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.captureError({
          error: new Error(`Resource failed to load: ${(event.target as any).src || (event.target as any).href}`),
          errorType: 'resource',
          context: {
            componentName: 'ResourceLoader',
            actionType: 'resource_load_error',
            customData: {
              tagName: (event.target as Element).tagName,
              src: (event.target as any).src,
              href: (event.target as any).href
            }
          }
        }
      }
    }, true)
  }

  /**
   * ネットワーク状態の監視
   */
  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🔗 Network connection restored')
      this.processErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📶 Network connection lost')
    })
  }

  /**
   * パフォーマンス情報の取得
   */
  private getPerformanceMetrics(): ErrorContext['performance'] | null {
    if (typeof window === 'undefined' || !window.performance) return null

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const memory = (performance as any).memory

      return {
        loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
        domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
        memoryUsage: memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        } : undefined
      }
    } catch (error) {
      console.warn('Failed to get performance metrics:', error)
      return null
    }
  }

  /**
   * ビューポート情報の取得
   */
  private getViewportInfo(): ErrorContext['viewport'] {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 }
    }

    return {
      width: window.innerWidth || document.documentElement.clientWidth || 0,
      height: window.innerHeight || document.documentElement.clientHeight || 0
    }
  }

  /**
   * エラーの重要度を自動判定
   */
  private determineSeverity(error: Error, errorType: ErrorType): ErrorSeverity {
    // クリティカルなエラータイプ
    if (errorType === 'critical' || errorType === 'auth') {
      return 'critical'
    }

    // APIエラーは通常高優先度
    if (errorType === 'api') {
      return 'high'
    }

    // エラーメッセージによる判定
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'high'
    }

    if (message.includes('memory') || message.includes('quota')) {
      return 'high'
    }

    // スタックトレースによる判定
    if (error.stack) {
      const stack = error.stack.toLowerCase()
      if (stack.includes('react') || stack.includes('component')) {
        return 'medium'
      }
    }

    return 'low'
  }

  /**
   * エラーの捕捉とレポート
   */
  public captureError(params: {
    error: Error
    errorType?: ErrorType
    context?: Partial<ErrorContext>
    severity?: ErrorSeverity
  }): void {
    try {
      const { error, errorType = 'javascript', context = {}, severity } = params

      // エラーレポートの作成
      const errorReport: ErrorReport = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        errorType,
        severity: severity || this.determineSeverity(error, errorType),
        message: error.message,
        stackTrace: error.stack,
        context: {
          ...context,
          sessionId: this.sessionId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          timestamp: new Date().toISOString(),
          viewport: this.getViewportInfo(),
          performance: this.getPerformanceMetrics()
        },
        retryCount: this.retryAttempts.get(error.message) || 0,
        timestamp: new Date().toISOString()
      }

      console.group(`🚨 [ErrorTracker] ${errorType.toUpperCase()} Error Captured`)
      console.log('📋 Error ID:', errorReport.id)
      console.log('🎯 Severity:', errorReport.severity)
      console.log('💬 Message:', errorReport.message)
      console.log('🔧 Context:', errorReport.context)
      if (errorReport.stackTrace) {
        console.log('📚 Stack:', errorReport.stackTrace)
      }
      console.groupEnd()

      // レポート送信または キューに追加
      if (this.reportingEnabled) {
        if (this.isOnline) {
          this.sendErrorReport(errorReport)
        } else {
          this.errorQueue.push(errorReport)
          console.log('📦 Error queued (offline mode):', errorReport.id)
        }
      }

    } catch (captureError) {
      console.error('❌ Failed to capture error:', captureError)
    }
  }

  /**
   * API エラーの捕捉
   */
  public captureApiError(params: {
    error: Error
    endpoint: string
    method: string
    statusCode?: number
    responseBody?: any
    context?: Partial<ErrorContext>
  }): void {
    this.captureError({
      error: params.error,
      errorType: 'api',
      context: {
        ...params.context,
        componentName: params.context?.componentName || 'ApiClient',
        actionType: 'api_request',
        customData: {
          endpoint: params.endpoint,
          method: params.method,
          statusCode: params.statusCode,
          responseBody: params.responseBody
        }
      }
    })
  }

  /**
   * 認証エラーの捕捉
   */
  public captureAuthError(params: {
    error: Error
    authAction: string
    context?: Partial<ErrorContext>
  }): void {
    this.captureError({
      error: params.error,
      errorType: 'auth',
      severity: 'critical',
      context: {
        ...params.context,
        componentName: params.context?.componentName || 'AuthSystem',
        actionType: params.authAction,
        customData: {
          authAction: params.authAction
        }
      }
    })
  }

  /**
   * パフォーマンスエラーの捕捉
   */
  public capturePerformanceError(params: {
    metric: string
    value: number
    threshold: number
    context?: Partial<ErrorContext>
  }): void {
    this.captureError({
      error: new Error(`Performance threshold exceeded: ${params.metric} = ${params.value} (threshold: ${params.threshold})`),
      errorType: 'performance',
      context: {
        ...params.context,
        componentName: params.context?.componentName || 'PerformanceMonitor',
        actionType: 'performance_threshold_exceeded',
        customData: {
          metric: params.metric,
          value: params.value,
          threshold: params.threshold
        }
      }
    })
  }

  /**
   * エラーレポートの送信
   */
  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      const response = await fetch('/api/error-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: errorReport.id,
          timestamp: errorReport.timestamp,
          errorType: errorReport.errorType,
          message: errorReport.message,
          userAgent: errorReport.context.userAgent,
          url: errorReport.context.url,
          userId: errorReport.context.userId,
          stackTrace: errorReport.stackTrace,
          retryCount: errorReport.retryCount,
          sessionId: errorReport.context.sessionId,
          viewport: errorReport.context.viewport,
          performance: errorReport.context.performance,
          component: errorReport.context.componentName,
          context: {
            actionType: errorReport.context.actionType,
            customData: errorReport.context.customData
          }
        })
      })

      if (response.ok) {
        console.log(`✅ Error report sent successfully: ${errorReport.id}`)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }

    } catch (sendError) {
      console.error('❌ Failed to send error report:', sendError)

      // リトライカウントを増やしてキューに戻す
      const retryCount = this.retryAttempts.get(errorReport.message) || 0
      if (retryCount < 3) {
        this.retryAttempts.set(errorReport.message, retryCount + 1)
        errorReport.retryCount = retryCount + 1
        this.errorQueue.push(errorReport)
        console.log(`🔄 Error report queued for retry (${retryCount + 1}/3): ${errorReport.id}`)
      } else {
        console.error(`❌ Error report dropped after 3 failed attempts: ${errorReport.id}`)
      }
    }
  }

  /**
   * キューにたまっているエラーレポートの処理
   */
  private async processErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.isOnline) return

    console.log(`🔄 Processing ${this.errorQueue.length} queued error reports`)

    const queue = [...this.errorQueue]
    this.errorQueue = []

    for (const errorReport of queue) {
      await this.sendErrorReport(errorReport)
      // 送信間隔を調整（レート制限対策）
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  /**
   * エラートラッカーの設定変更
   */
  public configure(config: {
    reportingEnabled?: boolean
  }): void {
    if (config.reportingEnabled !== undefined) {
      this.reportingEnabled = config.reportingEnabled
      console.log(`🔧 Error reporting ${config.reportingEnabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * 統計情報の取得
   */
  public getStats(): {
    sessionId: string
    queuedErrors: number
    isOnline: boolean
    reportingEnabled: boolean
  } {
    return {
      sessionId: this.sessionId,
      queuedErrors: this.errorQueue.length,
      isOnline: this.isOnline,
      reportingEnabled: this.reportingEnabled
    }
  }
}

// シングルトンインスタンスをエクスポート
export const errorTracker = ErrorTracker.getInstance()

// 便利な関数をエクスポート
export const captureError = (error: Error, context?: Partial<ErrorContext>) => {
  errorTracker.captureError({ error, context })
}

export const captureApiError = (params: Parameters<typeof errorTracker.captureApiError>[0]) => {
  errorTracker.captureApiError(params)
}

export const captureAuthError = (params: Parameters<typeof errorTracker.captureAuthError>[0]) => {
  errorTracker.captureAuthError(params)
}

export const capturePerformanceError = (params: Parameters<typeof errorTracker.capturePerformanceError>[0]) => {
  errorTracker.capturePerformanceError(params)
}