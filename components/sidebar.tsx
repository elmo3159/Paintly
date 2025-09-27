'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // StrictMode対応: 一意なインスタンスIDを生成
  const [instanceId] = useState(() => `sidebar-${Math.random().toString(36).substr(2, 9)}`)

  // Supabaseクライアントをstableに保つ
  const supabase = useMemo(() => createClient(), [])

  // 検索入力ハンドラを最適化（フォーカス維持）
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
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
    console.log('🔍 DEBUG: fetchCustomers started')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Auth error:', authError)
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
      console.error('❌ Error fetching customers:', error)
      return
    }

    if (!error && data) {
      console.log('✅ Setting customers:', data.length, 'items')
      setCustomers(data)
    }
  }, [supabase])

  const fetchPlanInfo = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return
    }

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
      console.error('Error fetching plan info:', error)
      return
    }

    if (data && data.plans) {
      const planInfo = {
        plan_name: (data.plans as any).name,
        generation_limit: (data.plans as any).generation_limit,
        generation_count: data.generation_count
      }
      setPlanInfo(planInfo)
    }
  }, [supabase])

  const handleNewCustomer = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const newCustomer = {
      user_id: user.id,
      title: `新規顧客 ${new Date().toLocaleDateString('ja-JP')}`,
    }

    try {
      const { data, error } = await supabase
        .from('customer_pages')
        .insert(newCustomer)
        .select()
        .single()

      if (error) {
        console.error('Error creating customer:', error)
        return
      }

      if (data) {
        setCustomers(prev => [data, ...prev])
        window.location.href = `/customer/${data.id}`
      }
    } catch (catchError) {
      console.error('Unexpected error:', catchError)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/signin'
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

  const SidebarContent = () => (
    <>
      <div
        className="flex h-14 items-center justify-between border-b px-4"
        style={{ borderColor: '#e5e5e5' }}
      >
        <Link href="/dashboard" className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="Paintly" 
            className="h-20 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">
        {/* 固定部分 - flex-shrink-0でサイズ固定 */}
        <div className="p-1 space-y-1 flex-shrink-0">
          <button
            onClick={closeSidebar}
            className="w-full flex items-center justify-center p-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-2.5 w-2.5 mr-1" />
            サイドバーを閉じる
          </button>

          <button
            onClick={handleNewCustomer}
            className="w-full flex items-center justify-center p-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-2.5 w-2.5 mr-1" />
            新規顧客ページ作成
          </button>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">ナビゲーション</h4>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                  pathname === '/dashboard'
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Home className="h-3 w-3" />
                <span>ダッシュボード</span>
              </Link>
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
                onFocus={(e) => {
                  e.target.setSelectionRange(e.target.value.length, e.target.value.length)
                }}
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
              maxHeight: 'none',
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
  )

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

      <div className={cn(
        "fixed left-0 top-0 h-screen w-80 bg-white border-r z-50 transform transition-transform duration-300",
        "md:relative md:transform-none",
        (isMobileOpen || isSidebarOpen) ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>
    </div>
  )
}