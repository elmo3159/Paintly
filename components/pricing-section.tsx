'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronRight } from 'lucide-react'

export function PricingSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            あなたのビジネスに最適なプラン
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            無料プランから始めて、ビジネスの成長に合わせてアップグレード
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* ライトプラン */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ライトプラン</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">¥2,980</div>
              <p className="text-gray-600">/月</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                <span className="text-gray-700">月30回の画像生成</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                <span className="text-gray-700">顧客管理無制限</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                無料で始める
              </Button>
            </Link>
          </div>

          {/* スタンダードプラン（人気） */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-8 shadow-2xl transform scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              人気No.1
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">スタンダード</h3>
              <div className="text-4xl font-bold text-white mb-2">¥5,980</div>
              <p className="text-white/90">/月</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white">月100回の画像生成</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white">顧客管理無制限</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button className="w-full bg-white text-orange-700 hover:bg-gray-100 font-bold">
                無料で始める
              </Button>
            </Link>
          </div>

          {/* プロプラン */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">プロプラン</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">¥9,980</div>
              <p className="text-gray-600">/月</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                <span className="text-gray-700">月300回の画像生成</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                <span className="text-gray-700">顧客管理無制限</span>
              </li>
            </ul>
            <Link href="/auth/signup" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                無料で始める
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-700 font-semibold text-lg">
            すべての料金プランを見る
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
