'use client'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}: SkeletonProps) {
  return (
    <div 
      className={`
        animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
        dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
        ${width} ${height} ${rounded ? 'rounded-full' : 'rounded'} ${className}
      `}
      style={{
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite'
      }}
    />
  )
}

// ダッシュボード用スケルトン
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* ヘッダースケルトン */}
      <div className="space-y-4">
        <Skeleton height="h-8" width="w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <Skeleton height="h-4" width="w-24" />
              <Skeleton height="h-8" width="w-16" />
              <Skeleton height="h-3" width="w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* コンテンツスケルトン */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton height="h-6" width="w-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <Skeleton width="w-12" height="h-12" rounded />
              <div className="flex-1 space-y-2">
                <Skeleton height="h-4" width="w-24" />
                <Skeleton height="h-3" width="w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton height="h-6" width="w-40" />
          <Skeleton height="h-48" />
        </div>
      </div>
    </div>
  )
}

// 顧客ページ用スケルトン
export function CustomerPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-10" width="w-24" />
      </div>

      {/* タブ */}
      <div className="flex space-x-4 border-b">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="h-10" width="w-20" />
        ))}
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: 画像比較エリア */}
        <div className="space-y-4">
          <Skeleton height="h-6" width="w-32" />
          <Skeleton height="h-64" />
          <div className="flex space-x-2">
            <Skeleton height="h-8" width="w-16" />
            <Skeleton height="h-8" width="w-16" />
          </div>
        </div>

        {/* 右側: フォームエリア */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton height="h-6" width="w-24" />
            <Skeleton height="h-32" />
          </div>
          
          <div className="space-y-4">
            <Skeleton height="h-6" width="w-20" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton height="h-4" width="w-16" />
                <Skeleton height="h-10" />
              </div>
            ))}
          </div>

          <Skeleton height="h-12" />
        </div>
      </div>
    </div>
  )
}

// 画像比較スケルトン
export function ImageComparisonSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton height="h-6" width="w-32" />
        <div className="flex space-x-2">
          <Skeleton height="h-8" width="w-8" rounded />
          <Skeleton height="h-8" width="w-16" />
          <Skeleton height="h-8" width="w-16" />
        </div>
      </div>
      
      <div className="relative">
        <Skeleton height="h-96" />
        
        {/* スライダーライン */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/50 rounded">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// 履歴リスト用スケルトン
export function HistoryListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height="h-6" width="w-24" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded">
          <Skeleton width="w-16" height="h-16" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton height="h-4" width="w-32" />
              <Skeleton height="h-4" width="w-16" />
            </div>
            <Skeleton height="h-3" width="w-24" />
            <Skeleton height="h-3" width="w-40" />
          </div>
          <div className="flex space-x-2">
            <Skeleton height="h-8" width="w-8" rounded />
            <Skeleton height="h-8" width="w-8" rounded />
          </div>
        </div>
      ))}
    </div>
  )
}

// CSS アニメーション
export const skeletonStyles = `
  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`