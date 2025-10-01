/**
 * エラー分析・集約システム
 * 類似エラーのグループ化、パターン分析、トレンド検出
 */

export interface ErrorPattern {
  id: string
  signature: string // エラーの署名（類似エラーをグループ化するためのハッシュ）
  title: string
  description: string
  occurrences: number
  firstSeen: string
  lastSeen: string
  errorType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedUsers: string[]
  affectedComponents: string[]
  commonStackTrace?: string
  suggestedActions: string[]
  tags: string[]
  status: 'new' | 'investigating' | 'resolved' | 'ignored'
}

export interface ErrorTrend {
  timeframe: string
  totalErrors: number
  byType: Record<string, number>
  byComponent: Record<string, number>
  severity: Record<string, number>
  changeFromPrevious: {
    total: number
    percentage: number
  }
}

export interface ErrorInsight {
  type: 'spike' | 'pattern' | 'regression' | 'new_error' | 'improvement'
  title: string
  description: string
  severity: 'info' | 'warning' | 'error'
  data: any
  actionable: boolean
  suggestedActions: string[]
}

class ErrorAnalyzer {
  private static instance: ErrorAnalyzer | null = null

  private constructor() {}

  public static getInstance(): ErrorAnalyzer {
    if (!ErrorAnalyzer.instance) {
      ErrorAnalyzer.instance = new ErrorAnalyzer()
    }
    return ErrorAnalyzer.instance
  }

  /**
   * エラーの署名を生成（類似エラーをグループ化するため）
   */
  public generateErrorSignature(error: {
    message: string
    stackTrace?: string
    componentName?: string
    errorType: string
  }): string {
    try {
      // メッセージを正規化（動的な値を除去）
      const normalizedMessage = this.normalizeErrorMessage(error.message)

      // スタックトレースの最初の数行を使用（ファイル名とライン番号を除去）
      const normalizedStack = error.stackTrace
        ? this.normalizeStackTrace(error.stackTrace)
        : ''

      // 署名の生成
      const signatureString = [
        error.errorType,
        error.componentName || 'unknown',
        normalizedMessage,
        normalizedStack
      ].join('|')

      // ハッシュ生成（簡易版）
      return this.simpleHash(signatureString)

    } catch (err) {
      console.error('Error generating signature:', err)
      return this.simpleHash(error.message + error.errorType)
    }
  }

  /**
   * 単一エラーの分析・処理
   */
  public async analyzeError(error: {
    id: string
    errorType: string
    message: string
    stackTrace?: string
    componentName?: string
    url?: string
    timestamp: string
    userId?: string
    sessionId?: string
    context?: any
  }): Promise<{
    signature: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    classification: string
    suggestions: string[]
  }> {
    try {
      // エラーの署名を生成
      const signature = this.generateErrorSignature({
        message: error.message,
        stackTrace: error.stackTrace,
        componentName: error.componentName,
        errorType: error.errorType
      })

      // 重要度を判定
      const severity = this.classifyErrorSeverity(error)

      // エラーの分類
      const classification = this.classifyError(error)

      // 提案を生成
      const suggestions = this.generateErrorSuggestions(error, severity)

      // 開発環境では詳細ログを出力
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [Error Analysis]', {
          id: error.id,
          signature,
          severity,
          classification,
          suggestions
        })
      }

      return {
        signature,
        severity,
        classification,
        suggestions
      }

    } catch (analysisError) {
      console.error('❌ [Error Analysis] Failed to analyze error:', analysisError)
      
      // フォールバック値を返す
      return {
        signature: this.simpleHash(error.message + error.errorType),
        severity: 'medium',
        classification: 'unknown',
        suggestions: ['エラーの詳細を確認してください']
      }
    }
  }

  /**
   * エラーの重要度を分類
   */
  private classifyErrorSeverity(error: {
    errorType: string
    message: string
    stackTrace?: string
    url?: string
  }): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase()
    
    // クリティカルレベル
    if (
      message.includes('payment') ||
      message.includes('billing') ||
      message.includes('stripe') ||
      message.includes('security') ||
      message.includes('unauthorized') ||
      error.errorType === 'security'
    ) {
      return 'critical'
    }

    // 高レベル
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('signup') ||
      message.includes('database') ||
      message.includes('supabase') ||
      error.errorType === 'auth' ||
      error.errorType === 'api'
    ) {
      return 'high'
    }

    // 中レベル
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      error.errorType === 'javascript' ||
      error.errorType === 'performance'
    ) {
      return 'medium'
    }

    // 低レベル（デフォルト）
    return 'low'
  }

  /**
   * エラーの分類
   */
  private classifyError(error: {
    errorType: string
    message: string
    stackTrace?: string
    componentName?: string
  }): string {
    const message = error.message.toLowerCase()
    
    // APIエラー
    if (error.errorType === 'api' || message.includes('fetch') || message.includes('api')) {
      return 'api-communication'
    }

    // 認証エラー
    if (error.errorType === 'auth' || message.includes('auth') || message.includes('login')) {
      return 'authentication'
    }

    // パフォーマンスエラー
    if (error.errorType === 'performance' || message.includes('memory') || message.includes('timeout')) {
      return 'performance'
    }

    // UI/レンダリングエラー
    if (message.includes('render') || message.includes('component') || error.componentName) {
      return 'ui-rendering'
    }

    // ネットワークエラー
    if (message.includes('network') || message.includes('connection')) {
      return 'network'
    }

    // JavaScriptランタイムエラー
    if (error.errorType === 'javascript') {
      return 'runtime'
    }

    return 'general'
  }

  /**
   * エラーに対する提案を生成
   */
  private generateErrorSuggestions(
    error: {
      errorType: string
      message: string
      stackTrace?: string
      componentName?: string
    },
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string[] {
    const suggestions: string[] = []
    const message = error.message.toLowerCase()

    // 重要度別の基本的な提案
    if (severity === 'critical') {
      suggestions.push('即座の対応が必要です')
      suggestions.push('関連チームに緊急報告')
    } else if (severity === 'high') {
      suggestions.push('優先的な修正が必要です')
      suggestions.push('次回リリースで修正予定')
    }

    // エラータイプ別の提案
    switch (error.errorType) {
      case 'api':
        suggestions.push('APIエンドポイントの状態を確認')
        suggestions.push('リトライメカニズムの実装を検討')
        break

      case 'auth':
        suggestions.push('認証フローの見直し')
        suggestions.push('セッション管理の改善')
        break

      case 'javascript':
        suggestions.push('スタックトレースを確認してバグの原因を特定')
        suggestions.push('該当コードの単体テストを追加')
        break

      case 'performance':
        suggestions.push('パフォーマンス最適化の実施')
        suggestions.push('メモリ使用量の監視強化')
        break
    }

    // メッセージ内容による提案
    if (message.includes('network') || message.includes('fetch')) {
      suggestions.push('ネットワーク接続の安定性を確認')
      suggestions.push('オフライン対応の実装を検討')
    }

    if (message.includes('timeout')) {
      suggestions.push('タイムアウト時間の調整')
      suggestions.push('処理の非同期化を検討')
    }

    if (message.includes('memory')) {
      suggestions.push('メモリリークの調査')
      suggestions.push('不要なリソースの解放')
    }

    // デフォルト提案
    if (suggestions.length === 0) {
      suggestions.push('エラーログの詳細確認')
      suggestions.push('再現手順の特定')
    }

    return suggestions
  }

  /**
   * エラーメッセージの正規化
   */
  private normalizeErrorMessage(message: string): string {
    return message
      // URLを正規化
      .replace(/https?:\/\/[^\s]+/g, '<URL>')
      // ファイルパスを正規化
      .replace(/[A-Z]:[\\\/][^\s]+/g, '<PATH>')
      // 数値IDを正規化
      .replace(/\b\d{3,}\b/g, '<ID>')
      // タイムスタンプを正規化
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '<TIMESTAMP>')
      // ランダムな文字列を正規化
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '<UUID>')
      // 小文字に統一
      .toLowerCase()
      // 余分な空白を削除
      .trim()
  }

  /**
   * スタックトレースの正規化
   */
  private normalizeStackTrace(stackTrace: string): string {
    const lines = stackTrace.split('\n').slice(0, 5) // 最初の5行のみ使用

    return lines
      .map(line =>
        line
          // ファイル名とライン番号を除去
          .replace(/\s+at\s+.*?:\d+:\d+/g, ' at <LOCATION>')
          .replace(/\s+at\s+.*?\(\S+:\d+:\d+\)/g, ' at <FUNCTION>')
          // ファイルパスを正規化
          .replace(/[A-Z]:[\\\/][^\s]+/g, '<PATH>')
          // Webpack/Bundler固有のパスを正規化
          .replace(/webpack:\/\/\/.*?\//g, '<WEBPACK>/')
          .trim()
      )
      .filter(line => line.length > 0)
      .join('\n')
  }

  /**
   * 簡易ハッシュ関数
   */
  private simpleHash(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 32bit整数に変換
    }

    return Math.abs(hash).toString(16)
  }

  /**
   * エラーパターンの分析
   */
  public analyzeErrorPatterns(errors: Array<{
    id: string
    message: string
    stackTrace?: string
    componentName?: string
    errorType: string
    timestamp: string
    userId?: string
    severity: string
  }>): ErrorPattern[] {
    try {
      // 署名別にエラーをグループ化
      const patternMap = new Map<string, {
        signature: string
        errors: typeof errors
        pattern: Partial<ErrorPattern>
      }>()

      for (const error of errors) {
        const signature = this.generateErrorSignature(error)

        if (!patternMap.has(signature)) {
          patternMap.set(signature, {
            signature,
            errors: [],
            pattern: {
              id: `pattern_${signature}`,
              signature,
              errorType: error.errorType,
              severity: error.severity as any,
              affectedUsers: [],
              affectedComponents: [],
              suggestedActions: [],
              tags: [],
              status: 'new'
            }
          })
        }

        const patternData = patternMap.get(signature)!
        patternData.errors.push(error)
      }

      // パターンの詳細情報を計算
      const patterns: ErrorPattern[] = []

      for (const [signature, data] of patternMap) {
        const { errors, pattern } = data
        const firstError = errors[0]
        const lastError = errors[errors.length - 1]

        // 影響を受けたユーザーとコンポーネントを収集
        const affectedUsers = [...new Set(errors.map(e => e.userId).filter(Boolean))] as string[]
        const affectedComponents = [...new Set(errors.map(e => e.componentName).filter(Boolean))] as string[]

        // 代表的なスタックトレースを選択
        const commonStackTrace = this.findCommonStackTrace(errors.map(e => e.stackTrace).filter(Boolean) as string[])

        // 提案されるアクションを生成
        const suggestedActions = this.generateSuggestedActions(firstError, errors.length, affectedComponents)

        // タグを生成
        const tags = this.generateTags(firstError, errors, affectedComponents)

        // 重要度を再評価
        const severity = this.calculatePatternSeverity(firstError.severity as any, errors.length, affectedUsers.length)

        const completePattern: ErrorPattern = {
          ...pattern,
          title: this.generatePatternTitle(firstError),
          description: this.generatePatternDescription(firstError, errors.length),
          occurrences: errors.length,
          firstSeen: firstError.timestamp,
          lastSeen: lastError.timestamp,
          severity,
          affectedUsers,
          affectedComponents,
          commonStackTrace,
          suggestedActions,
          tags
        } as ErrorPattern

        patterns.push(completePattern)
      }

      // 発生回数でソート
      return patterns.sort((a, b) => b.occurrences - a.occurrences)

    } catch (err) {
      console.error('Error analyzing patterns:', err)
      return []
    }
  }

  /**
   * 共通のスタックトレースを見つける
   */
  private findCommonStackTrace(stackTraces: string[]): string | undefined {
    if (stackTraces.length === 0) return undefined
    if (stackTraces.length === 1) return stackTraces[0]

    // 最初のスタックトレースを基準にする
    const lines = stackTraces[0].split('\n')
    const commonLines: string[] = []

    for (const line of lines) {
      const normalizedLine = this.normalizeStackTrace(line)

      // 全てのスタックトレースに含まれている行かチェック
      const foundInAll = stackTraces.every(stack =>
        this.normalizeStackTrace(stack).includes(normalizedLine)
      )

      if (foundInAll) {
        commonLines.push(line)
      }
    }

    return commonLines.length > 0 ? commonLines.join('\n') : stackTraces[0]
  }

  /**
   * パターンのタイトルを生成
   */
  private generatePatternTitle(error: any): string {
    const component = error.componentName ? `[${error.componentName}] ` : ''
    const type = error.errorType.charAt(0).toUpperCase() + error.errorType.slice(1)

    // エラーメッセージから簡潔なタイトルを抽出
    let title = error.message
    if (title.length > 60) {
      title = title.substring(0, 57) + '...'
    }

    return `${component}${type}: ${title}`
  }

  /**
   * パターンの説明を生成
   */
  private generatePatternDescription(error: any, occurrences: number): string {
    const frequency = occurrences > 10 ? '頻繁に' : occurrences > 5 ? '時々' : '稀に'
    const component = error.componentName ? `${error.componentName}コンポーネントで` : ''

    return `このエラーは${component}${frequency}発生しています（${occurrences}回）。${error.errorType}タイプのエラーで、適切な対処が必要です。`
  }

  /**
   * 提案されるアクションを生成
   */
  private generateSuggestedActions(error: any, occurrences: number, affectedComponents: string[]): string[] {
    const actions: string[] = []

    // エラータイプ別の提案
    switch (error.errorType) {
      case 'javascript':
        actions.push('スタックトレースを確認してバグの原因を特定')
        actions.push('該当するコードの単体テストを追加')
        break
      case 'api':
        actions.push('APIエンドポイントの状態を確認')
        actions.push('リトライ機構の実装を検討')
        actions.push('エラーハンドリングの改善')
        break
      case 'auth':
        actions.push('認証フローの見直し')
        actions.push('セッション管理の改善')
        break
      case 'resource':
        actions.push('リソースのロード方法を見直し')
        actions.push('フォールバック機能の実装')
        break
      case 'performance':
        actions.push('パフォーマンス最適化の実施')
        actions.push('メモリ使用量の監視強化')
        break
    }

    // 発生頻度に基づく提案
    if (occurrences > 20) {
      actions.push('高優先度での修正が必要')
      actions.push('ホットフィックスの検討')
    } else if (occurrences > 5) {
      actions.push('次回リリースでの修正を計画')
    }

    // 影響範囲に基づく提案
    if (affectedComponents.length > 3) {
      actions.push('共通ライブラリまたはユーティリティの修正を検討')
    }

    return actions
  }

  /**
   * タグを生成
   */
  private generateTags(error: any, errors: any[], affectedComponents: string[]): string[] {
    const tags: string[] = [error.errorType]

    // 頻度タグ
    if (errors.length > 20) tags.push('high-frequency')
    else if (errors.length > 5) tags.push('medium-frequency')
    else tags.push('low-frequency')

    // コンポーネントタグ
    if (affectedComponents.length > 1) tags.push('multi-component')
    if (affectedComponents.some(c => c.includes('auth'))) tags.push('auth-related')
    if (affectedComponents.some(c => c.includes('api'))) tags.push('api-related')

    // メッセージ内容によるタグ
    const message = error.message.toLowerCase()
    if (message.includes('network') || message.includes('fetch')) tags.push('network')
    if (message.includes('permission') || message.includes('unauthorized')) tags.push('security')
    if (message.includes('memory') || message.includes('quota')) tags.push('resource')

    return tags
  }

  /**
   * パターンの重要度を計算
   */
  private calculatePatternSeverity(
    originalSeverity: 'low' | 'medium' | 'high' | 'critical',
    occurrences: number,
    affectedUsers: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    let severityScore = 0

    // 元の重要度をスコア化
    switch (originalSeverity) {
      case 'critical': severityScore += 4; break
      case 'high': severityScore += 3; break
      case 'medium': severityScore += 2; break
      case 'low': severityScore += 1; break
    }

    // 発生回数による重み
    if (occurrences > 50) severityScore += 2
    else if (occurrences > 20) severityScore += 1
    else if (occurrences > 10) severityScore += 0.5

    // 影響ユーザー数による重み
    if (affectedUsers > 20) severityScore += 2
    else if (affectedUsers > 10) severityScore += 1
    else if (affectedUsers > 5) severityScore += 0.5

    // スコアを重要度に変換
    if (severityScore >= 6) return 'critical'
    if (severityScore >= 4) return 'high'
    if (severityScore >= 2.5) return 'medium'
    return 'low'
  }

  /**
   * エラートレンドの分析
   */
  public analyzeErrorTrends(
    currentPeriodErrors: any[],
    previousPeriodErrors: any[]
  ): ErrorTrend {
    const current = this.aggregateErrorStats(currentPeriodErrors)
    const previous = this.aggregateErrorStats(previousPeriodErrors)

    const totalChange = current.total - previous.total
    const percentageChange = previous.total > 0
      ? Math.round((totalChange / previous.total) * 100)
      : 100

    return {
      timeframe: 'current',
      totalErrors: current.total,
      byType: current.byType,
      byComponent: current.byComponent,
      severity: current.severity,
      changeFromPrevious: {
        total: totalChange,
        percentage: percentageChange
      }
    }
  }

  /**
   * エラー統計の集約
   */
  private aggregateErrorStats(errors: any[]): {
    total: number
    byType: Record<string, number>
    byComponent: Record<string, number>
    severity: Record<string, number>
  } {
    const stats = {
      total: errors.length,
      byType: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      severity: {} as Record<string, number>
    }

    for (const error of errors) {
      // エラータイプ別
      stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1

      // コンポーネント別
      const component = error.componentName || 'unknown'
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1

      // 重要度別
      stats.severity[error.severity] = (stats.severity[error.severity] || 0) + 1
    }

    return stats
  }

  /**
   * インサイトの生成
   */
  public generateInsights(patterns: ErrorPattern[], trends: ErrorTrend): ErrorInsight[] {
    const insights: ErrorInsight[] = []

    // エラー急増の検出
    if (trends.changeFromPrevious.percentage > 50 && trends.changeFromPrevious.total > 10) {
      insights.push({
        type: 'spike',
        title: 'エラー数の急増を検出',
        description: `前期間と比較してエラーが${trends.changeFromPrevious.percentage}%増加しています（+${trends.changeFromPrevious.total}件）`,
        severity: 'error',
        data: trends.changeFromPrevious,
        actionable: true,
        suggestedActions: [
          '最近のデプロイメントを確認',
          '高頻度エラーパターンを優先的に調査',
          'モニタリングアラートの設定を検討'
        ]
      })
    }

    // 新しいエラーパターンの検出
    const newPatterns = patterns.filter(p => p.status === 'new' && p.occurrences > 3)
    if (newPatterns.length > 0) {
      insights.push({
        type: 'new_error',
        title: `${newPatterns.length}個の新しいエラーパターンを検出`,
        description: '新しいエラーパターンが発見されました。調査が必要です。',
        severity: 'warning',
        data: newPatterns,
        actionable: true,
        suggestedActions: [
          '新しいエラーパターンを調査',
          '関連するコード変更を確認',
          'エラーパターンを分類・優先順位付け'
        ]
      })
    }

    // クリティカルエラーの検出
    const criticalPatterns = patterns.filter(p => p.severity === 'critical')
    if (criticalPatterns.length > 0) {
      insights.push({
        type: 'regression',
        title: `${criticalPatterns.length}個のクリティカルエラーパターン`,
        description: '即座の対応が必要なクリティカルエラーが発生しています。',
        severity: 'error',
        data: criticalPatterns,
        actionable: true,
        suggestedActions: [
          'クリティカルエラーを最優先で修正',
          '影響を受けるユーザーへの対応を検討',
          'ホットフィックスの実施を検討'
        ]
      })
    }

    // パフォーマンスの改善
    if (trends.changeFromPrevious.percentage < -20 && trends.changeFromPrevious.total < -5) {
      insights.push({
        type: 'improvement',
        title: 'エラー数の改善を検出',
        description: `エラー数が${Math.abs(trends.changeFromPrevious.percentage)}%減少しています`,
        severity: 'info',
        data: trends.changeFromPrevious,
        actionable: false,
        suggestedActions: [
          '改善要因を分析・文書化',
          'ベストプラクティスを他の領域に適用'
        ]
      })
    }

    return insights
  }
}

// シングルトンインスタンスをエクスポート
export const errorAnalyzer = ErrorAnalyzer.getInstance()