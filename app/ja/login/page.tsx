'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 正しいサインインページにリダイレクト
    router.replace('/auth/signin')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>リダイレクト中...</p>
      </div>
    </div>
  )
}