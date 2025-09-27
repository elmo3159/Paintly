'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PromptDisplayProps {
  prompt: string
  title?: string
  description?: string
}

export function PromptDisplay({
  prompt,
  title = "生成プロンプト",
  description
}: PromptDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="w-full">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          <span className="text-sm font-normal">
            {isOpen ? '▼' : '▶'}
          </span>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <div className="max-h-64 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 rounded border text-sm">
            <pre className="whitespace-pre-wrap">{prompt}</pre>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            文字数: {prompt.length} 文字
          </div>
        </CardContent>
      )}
    </Card>
  )
}