'use client'

import { Sidebar } from '@/components/sidebar'

export default function TestSidebarPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">サイドバーテストページ</h1>
        <p className="text-gray-600 mb-4">
          このページはサイドバーの実装をテストするためのページです。
        </p>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">実装された変更内容:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>設定ボタンをサイドバー下部の「永久アカウント」エリアに移動</li>
            <li>設定ボタンクリックで「アカウント設定」「料金プラン」が展開表示</li>
            <li>上部ナビゲーションから設定・料金プランボタンを削除</li>
            <li>全体的なボタンサイズを最適化</li>
            <li>顧客ページリスト表示エリアを拡大</li>
          </ul>
        </div>
      </div>
    </div>
  )
}