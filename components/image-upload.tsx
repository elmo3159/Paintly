'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  label: string
  onChange: (file: File | null) => void
  required?: boolean
  helperText?: string
}

export function ImageUpload({ label, onChange, required = false, helperText }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setFileName(file.name)
      onChange(file)
    }
  }, [onChange])

  const removeImage = () => {
    setPreview(null)
    setFileName(null)
    onChange(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}

      {!preview ? (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-center text-muted-foreground">
              {isDragActive
                ? 'ドロップして画像をアップロード'
                : 'クリックまたはドラッグ&ドロップで画像をアップロード'}
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">
              対応形式: JPEG, PNG, WebP
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={preview}
                alt="アップロードされた画像"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeImage}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}