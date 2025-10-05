'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Home,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  FileText,
  ArrowLeft,
  Search,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Client-side error reporting function
const reportClientError = (error: Error, context: string) => {
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          component: 'Sidebar'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

interface Customer {
  id: string
  title: string
  created_at: string
}

interface PlanInfo {
  plan_name: string
  generation_limit: number
  generation_count: number
}

export function Sidebar() {
  const pathname = usePathname()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  // レスポンシブな初期状態: Hydrationエラー回避のため初期値はfalse
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // StrictMode対応: 一意なインスタンスIDを生成
  const [instanceId] = useState(() => `sidebar-${Math.random().toString(36).substr(2, 9)}`)

  // Supabaseクライアントをstableに保つ
  const supabase = useMemo(() => createClient(), [])

  // 検索入力ハンドラ（フォーカス問題修正）
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  // 検索クリア機能 - useCallbackで最適化
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    // 検索入力にフォーカスを戻す
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // fetchCustomers関数をstableに保つ
  const fetchCustomers = useCallback(async () => {
    try {
      console.log('🔍 DEBUG: fetchCustomers started')

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        const error = new Error(`Authentication error: ${authError.message}`)
        console.error('❌ Auth error:', authError)
        reportClientError(error, 'fetchCustomers - Authentication failed')
        return
      }

      if (!user) {
        console.log('⚠️ No user found')
        return
      }

      console.log('✅ User found:', user.id)

      const { data, error } = await supabase
        .from('customer_pages')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📊 Customer query result:', { data, error, count: data?.length })

      if (error) {
        const fetchError = new Error(`Failed to fetch customers: ${error.message}`)
        console.error('❌ Error fetching customers:', error)
        reportClientError(fetchError, `fetchCustomers - Database query failed - User: ${user.id}`)

        // Set empty array as fallback instead of leaving in loading state
        setCustomers([])
        return
      }

      if (data) {
        console.log('✅ Setting customers:', data.length, 'items')
        setCustomers(data)
      } else {
        console.log('⚠️ No customer data returned')
        setCustomers([])
      }

    } catch (error) {
      const fetchError = error instanceof Error ? error : new Error('Unknown error in fetchCustomers')
      console.error('❌ Unexpected error in fetchCustomers:', fetchError)
      reportClientError(fetchError, 'fetchCustomers - Unexpected error')

      // Set empty array as fallback
      setCustomers([])
    }
  }, [supabase])

  const fetchPlanInfo = useCallback(async () => {
    try {
      console.log('🔍 DEBUG: fetchPlanInfo started')

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        const error = new Error(`Authentication error in fetchPlanInfo: ${authError.message}`)
        console.error('❌ Auth error in fetchPlanInfo:', authError)
        reportClientError(error, 'fetchPlanInfo - Authentication failed')
        return
      }

      if (!user) {
        console.log('⚠️ No user found in fetchPlanInfo')
        return
      }

      console.log('✅ User found in fetchPlanInfo:', user.id)

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          generation_count,
          plans (
            name,
            generation_limit,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error) {
        const planError = new Error(`Failed to fetch plan info: ${error.message}`)
        console.error('❌ Error fetching plan info:', error)
        reportClientError(planError, `fetchPlanInfo - Database query failed - User: ${user.id}`)

        // Set fallback plan info (free plan)
        setPlanInfo({
          plan_name: '無料プラン',
          generation_limit: 3,
          generation_count: 0
        })
        return
      }

      if (data && data.plans) {
        const planInfo = {
          plan_name: (data.plans as any).name,
          generation_limit: (data.plans as any).generation_limit,
          generation_count: data.generation_count
        }
        console.log('✅ Plan info loaded successfully:', planInfo)
        setPlanInfo(planInfo)
      } else {
        console.log('⚠️ No plan data returned, using fallback')
        setPlanInfo({
          plan_name: '無料プラン',
          generation_limit: 3,
          generation_count: 0
        })
      }

    } catch (error) {
      const planError = error instanceof Error ? error : new Error('Unknown error in fetchPlanInfo')
      console.error('❌ Unexpected error in fetchPlanInfo:', planError)
      reportClientError(planError, 'fetchPlanInfo - Unexpected error')

      // Set fallback plan info
      setPlanInfo({
        plan_name: '無料プラン',
        generation_limit: 3,
        generation_count: 0
      })
    }
  }, [supabase])

  const handleNewCustomer = async () => {
    try {
      console.log('🔍 DEBUG: handleNewCustomer started')

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        const error = new Error(`Authentication error in handleNewCustomer: ${authError.message}`)
        console.error('❌ Auth error in handleNewCustomer:', authError)
        reportClientError(error, 'handleNewCustomer - Authentication failed')
        alert('認証エラーが発生しました。再度ログインしてください。')
        return
      }

      if (!user) {
        console.log('⚠️ No user found in handleNewCustomer')
        alert('ユーザー情報が見つかりません。再度ログインしてください。')
        return
      }

      console.log('✅ User found in handleNewCustomer:', user.id)

      const newCustomer = {
        user_id: user.id,
        title: `新規顧客 ${new Date().toLocaleDateString('ja-JP')}`,
      }

      console.log('📝 Creating new customer:', newCustomer)

      const { data, error } = await supabase
        .from('customer_pages')
        .insert(newCustomer)
        .select()
        .single()

      if (error) {
        const createError = new Error(`Failed to create customer: ${error.message}`)
        console.error('❌ Error creating customer:', error)
        reportClientError(createError, `handleNewCustomer - Database insert failed - User: ${user.id}`)
        alert('顧客ページの作成に失敗しました。しばらく後に再試行してください。')
        return
      }

      if (data) {
        console.log('✅ Customer created successfully:', data.id)
        setCustomers(prev => [data, ...prev])

        // Navigate to the new customer page
        try {
          window.location.href = `/customer/${data.id}`
        } catch (navError) {
          const navigationError = navError instanceof Error ? navError : new Error('Navigation failed')
          console.error('❌ Navigation error:', navigationError)
          reportClientError(navigationError, `handleNewCustomer - Navigation failed to /customer/${data.id}`)
          alert('ページの移動に失敗しました。手動でページをリロードしてください。')
        }
      } else {
        const noDataError = new Error('Customer created but no data returned')
        console.error('❌ No data returned after customer creation')
        reportClientError(noDataError, 'handleNewCustomer - No data returned')
        alert('顧客ページの作成に成功しましたが、データの取得に失敗しました。')
      }

    } catch (error) {
      const customerError = error instanceof Error ? error : new Error('Unknown error in handleNewCustomer')
      console.error('❌ Unexpected error in handleNewCustomer:', customerError)
      reportClientError(customerError, 'handleNewCustomer - Unexpected error')
      alert('予期しないエラーが発生しました。しばらく後に再試行してください。')
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('🔍 DEBUG: handleSignOut started')

      const { error } = await supabase.auth.signOut()

      if (error) {
        const signOutError = new Error(`Sign out failed: ${error.message}`)
        console.error('❌ Sign out error:', error)
        reportClientError(signOutError, 'handleSignOut - Sign out failed')
        alert('サインアウトに失敗しました。再試行してください。')
        return
      }

      console.log('✅ Sign out successful')

      // Navigate to sign in page
      try {
        window.location.href = '/auth/signin'
      } catch (navError) {
        const navigationError = navError instanceof Error ? navError : new Error('Navigation failed after sign out')
        console.error('❌ Navigation error after sign out:', navigationError)
        reportClientError(navigationError, 'handleSignOut - Navigation failed to /auth/signin')
        alert('サインアウトは成功しましたが、ページの移動に失敗しました。手動でサインインページに移動してください。')
      }

    } catch (error) {
      const signOutError = error instanceof Error ? error : new Error('Unknown error in handleSignOut')
      console.error('❌ Unexpected error in handleSignOut:', signOutError)
      reportClientError(signOutError, 'handleSignOut - Unexpected error')
      alert('サインアウト中に予期しないエラーが発生しました。')
    }
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setIsMobileOpen(false)
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
    setIsMobileOpen(true)
  }

  // useEffect for initialization
  useEffect(() => {
    fetchCustomers()
    fetchPlanInfo()
  }, [fetchCustomers, fetchPlanInfo])

  // Event listener for customer updates
  useEffect(() => {
    const emergencyHandler = () => {
      fetchCustomers()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('customerUpdated', emergencyHandler)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('customerUpdated', emergencyHandler)
      }
    }
  }, [fetchCustomers])

  // レスポンシブ対応: ウィンドウサイズ変更時にサイドバーを自動調整
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // モバイルビューでは自動的に閉じる
        setIsSidebarOpen(false)
        setIsMobileOpen(false)
      } else {
        // デスクトップビューでは開く
        setIsSidebarOpen(true)
      }
    }

    // 初回マウント時に実行してHydrationエラーを回避
    handleResize()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // 検索フィルタリング機能 - useMemoで最適化
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers
    }
    return customers.filter(customer =>
      customer.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  }, [customers, searchTerm])


  const remainingGenerations = planInfo
    ? Math.max(0, planInfo.generation_limit - planInfo.generation_count)
    : 0

  const usagePercentage = planInfo
    ? Math.min(100, (planInfo.generation_count / planInfo.generation_limit) * 100)
    : 0

  const SidebarContent = useMemo(() => (
    <>
      <div
        className="flex h-14 items-center justify-center border-b px-4"
        style={{ borderColor: '#e5e5e5' }}
      >
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Paintly"
            width={142}
            height={80}
            priority={true}
            className="h-12 w-auto object-contain"
            sizes="(max-width: 768px) 142px, 142px"
          />
        </Link>
      </div>

      <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">
        {/* 固定部分 - flex-shrink-0でサイズ固定 */}
        <div className="p-1 space-y-1 flex-shrink-0">
          <Button
            onClick={closeSidebar}
            variant="neobrutalist"
            className="w-full text-xs h-auto py-1.5"
            size="sm"
          >
            <X className="h-3 w-3 mr-1.5" />
            サイドバーを閉じる
          </Button>

          <Button
            onClick={handleNewCustomer}
            variant="neobrutalist"
            className="w-full text-xs h-auto py-2"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            新規顧客ページ作成
          </Button>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">ナビゲーション</h4>
            <nav className="space-y-1">
              <Button
                asChild
                variant="neobrutalist"
                className="w-full text-xs h-auto py-1.5 justify-start"
                size="sm"
              >
                <Link href="/dashboard" className="flex items-center">
                  <Home className="h-3 w-3 mr-2" />
                  <span>ダッシュボード</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>

        {/* スクロール可能エリア - flex-1で残り領域を占める */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* 検索部分 - flex-shrink-0で固定 */}
          <div className="p-1 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">顧客ページ</h4>
              <span className="text-xs text-gray-500">{customers.length}件</span>
            </div>

            {/* 修正済み検索入力 - useMemoを削除してフォーカス維持 */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="顧客を検索..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                autoComplete="off"

              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* 顧客リスト - 動的高さでスクロール可能 */}
          <div
            className="flex-1 px-4 pb-2 customer-list-scroll overflow-y-auto"
            style={{
              minHeight: 0,
              maxHeight: 'calc(100vh - 400px)',
              height: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 #e2e8f0',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filteredCustomers.length > 0 ? (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customer/${customer.id}`}
                    className={cn(
                      "block p-3 rounded-lg border transition-colors",
                      pathname === `/customer/${customer.id}`
                        ? "bg-primary/10 border-primary text-primary"
                        : "hover:bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="font-medium text-sm truncate">
                      {customer.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(customer.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8">
                <Search className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">「{searchTerm}」に一致する顧客が見つかりません</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">顧客ページがまだありません</p>
                <p className="text-xs text-gray-400 mt-1">上の「＋」ボタンで作成できます</p>
              </div>
            )}
          </div>
        </div>

        {/* プラン情報 - flex-shrink-0で固定 */}
        <div className="border-t p-2 space-y-2 flex-shrink-0" style={{ borderColor: '#e5e5e5' }}>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium">
                {planInfo?.plan_name || '無料プラン'}
              </span>
              <span className="text-gray-500">
                {remainingGenerations}回 残り
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {planInfo?.generation_count || 0} / {planInfo?.generation_limit || 3} 回使用
            </p>
          </div>

          {/* 設定メニュー */}
          <div className="space-y-2">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              設定
              <span className={`ml-auto transition-transform ${isSettingsExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isSettingsExpanded && (
              <div className="space-y-1 pl-2">
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  <span>アカウント設定</span>
                </Link>
                <Link
                  href="/billing"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CreditCard className="h-3 w-3" />
                  <span>料金プラン</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="h-3 w-3" />
                  <span>サインアウト</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  ), [filteredCustomers, planInfo, remainingGenerations, usagePercentage, isSettingsExpanded, searchTerm, handleSearchChange, handleNewCustomer, closeSidebar, handleSignOut, pathname])

  if (!isSidebarOpen) {
    return (
      <button
        onClick={openSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>
    )
  }

  return (
    <div key={instanceId}>
      {(isMobileOpen || isSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <nav
        className={cn(
          "fixed left-0 top-0 h-screen w-80 bg-white/95 backdrop-blur-md border-r z-50 transform transition-transform duration-300 overflow-hidden",
          "md:relative md:transform-none",
          (isMobileOpen || isSidebarOpen) ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="メインナビゲーション"
        aria-hidden={!(isMobileOpen || isSidebarOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            closeSidebar()
          }
        }}
      >
        {SidebarContent}
      </nav>
    </div>
  )
}