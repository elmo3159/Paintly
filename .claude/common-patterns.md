# Paintly 共通実装パターン

## よく使うコマンド

### 開発環境起動
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクションモード起動
npm run start

# 型チェック
npm run type-check

# リント
npm run lint
```

### Supabase関連
```bash
# 型生成
npx supabase gen types typescript --project-id mockfjcakfzbzccabcgm > types/supabase.ts

# マイグレーション作成
npx supabase migration new [migration_name]

# マイグレーション実行
npx supabase db push
```

## コンポーネントパターン

### クライアントコンポーネント
```tsx
'use client'

import { useState } from 'react'

export default function ComponentName() {
  const [state, setState] = useState()
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### サーバーコンポーネント
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ComponentName() {
  const supabase = createClient()
  const { data } = await supabase.from('table').select()
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

## API Routeパターン

### 基本的なAPIエンドポイント
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('table')
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('table')
      .insert(body)
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## 画像処理パターン

### 画像のBase64変換
```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64.split(',')[1])
    }
    reader.onerror = reject
  })
}
```

### 画像リサイズ
```typescript
const resizeImage = async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    img.onload = () => {
      let width = img.width
      let height = img.height
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/jpeg', 0.8)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

## Gemini API呼び出しパターン

### 画像生成プロンプト
```typescript
const generateImage = async (imageBase64: string, wallColor: string, roofColor: string) => {
  const prompt = `
    この建物の画像を以下の条件で変更してください：
    
    1. 壁の色: ${wallColor}に変更
    2. 屋根の色: ${roofColor}に変更
    3. 建物の形状や構造は変更しない
    4. 周囲の環境は自然に調整
    
    リアルで自然な仕上がりにしてください。
  `
  
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image: imageBase64
    })
  })
  
  return response.json()
}
```

## エラーハンドリングパターン

### try-catch with error boundary
```tsx
'use client'

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>エラーが発生しました:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>再試行</button>
    </div>
  )
}

export default function MyComponent() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* Component content */}
    </ErrorBoundary>
  )
}
```

## 状態管理（Zustand）パターン

### Store定義
```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface StoreState {
  // State
  images: string[]
  selectedColor: string
  
  // Actions
  addImage: (image: string) => void
  setSelectedColor: (color: string) => void
  reset: () => void
}

const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        images: [],
        selectedColor: '',
        
        // Actions
        addImage: (image) => set((state) => ({ 
          images: [...state.images, image] 
        })),
        setSelectedColor: (color) => set({ selectedColor: color }),
        reset: () => set({ images: [], selectedColor: '' })
      }),
      {
        name: 'paintly-storage'
      }
    )
  )
)

export default useStore
```