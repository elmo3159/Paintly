'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Home, 
  Settings, 
  CreditCard,
  LogOut,
  Menu,
  X,
  FileText,
  User
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
  const supabase = createClient()

  useEffect(() => {
    fetchCustomers()
    fetchPlanInfo()
  }, [])

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('customers')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCustomers(data)
    }
  }

  const fetchPlanInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        generation_count,
        plans (
          name,
          generation_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!error && data && data.plans) {
      setPlanInfo({
        plan_name: (data.plans as any).name,
        generation_limit: (data.plans as any).generation_limit,
        generation_count: data.generation_count
      })
    }
  }

  const handleNewCustomer = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newCustomer = {
      user_id: user.id,
      title: `新規顧客 ${new Date().toLocaleDateString('ja-JP')}`,
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select()
      .single()

    if (!error && data) {
      setCustomers([data, ...customers])
      window.location.href = `/customer/${data.id}`
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/signin'
  }

  const remainingGenerations = planInfo 
    ? planInfo.generation_limit - planInfo.generation_count 
    : 0
  const usagePercentage = planInfo 
    ? (planInfo.generation_count / planInfo.generation_limit) * 100 
    : 0

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Paintly</span>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="px-3 py-4">
          <Button 
            onClick={handleNewCustomer}
            className="w-full justify-start"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            新規顧客ページ
          </Button>
        </div>

        <div className="px-3">
          <h4 className="mb-2 text-sm font-semibold">ナビゲーション</h4>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard" && "bg-accent"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              ダッシュボード
            </Link>
            <Link
              href="/billing"
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/billing" && "bg-accent"
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              料金プラン
            </Link>
            <Link
              href="/settings"
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/settings" && "bg-accent"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              設定
            </Link>
          </nav>
        </div>

        <div className="mt-4 px-3">
          <h4 className="mb-2 text-sm font-semibold">顧客ページ</h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {customers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customer/${customer.id}`}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    pathname === `/customer/${customer.id}` && "bg-accent"
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{customer.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="border-t p-4">
        {planInfo && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{planInfo.plan_name}</span>
              <span className="text-muted-foreground">
                {remainingGenerations}回 残り
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {planInfo.generation_count} / {planInfo.generation_limit} 回使用
            </p>
          </div>
        )}

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          サインアウト
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-background md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}