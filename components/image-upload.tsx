'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
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
          component: 'ImageUpload'
        })
      }).catch(console.error)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

export function ImageUpload({ label, onChange, required = false, helperText }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      if (!acceptedFiles || acceptedFiles.length === 0) {
        console.log('No files selected or files were rejected')
        return
      }

      const file = acceptedFiles[0]

      // Validate file
      if (!file) {
        throw new Error('Selected file is invalid')
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error(`ファイルサイズが大きすぎます。${maxSize / (1024 * 1024)}MB以下のファイルを選択してください。`)
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        throw new Error(`対応していないファイル形式です。JPEG、PNG、WebP形式のファイルを選択してください。`)
      }

      console.log('📁 Processing file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Compress image before uploading
      setCompressing(true)
      let compressedFile = file

      try {
        const compressionOptions = {
          maxSizeMB: 1, // 1MB max to stay well under Vercel's 4.5MB limit
          maxWidthOrHeight: 1920, // Maintain high quality
          useWebWorker: true,
          fileType: 'image/jpeg' as const // Convert to JPEG for better compression
        }

        console.log('🔄 Compressing image...')
        compressedFile = await imageCompression(file, compressionOptions)

        console.log('✅ Image compressed:', {
          originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
          reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
        })
      } catch (compressionError) {
        console.warn('⚠️ Compression failed, using original file:', compressionError)
        // If compression fails, use original file
        compressedFile = file
      } finally {
        setCompressing(false)
      }

      // Create preview with enhanced error handling
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const result = reader.result as string
          if (!result) {
            throw new Error('ファイルの読み込みに失敗しました')
          }

          console.log('✅ File preview created successfully')
          setPreview(result)
          setFileName(file.name)
          onChange(compressedFile)
        } catch (previewError) {
          const error = previewError instanceof Error ? previewError : new Error('Preview creation failed')
          console.error('❌ Preview creation error:', error)
          reportClientError(error, `File preview creation - File: ${file.name}`)
          alert(`画像プレビューの作成に失敗しました: ${error.message}`)
        }
      }

      reader.onerror = () => {
        const error = new Error(`ファイルの読み込み中にエラーが発生しました: ${file.name}`)
        console.error('❌ FileReader error:', error)
        reportClientError(error, `FileReader error - File: ${file.name}`)
        alert(`ファイルの読み込みに失敗しました: ${error.message}`)
      }

      reader.onabort = () => {
        const error = new Error(`ファイルの読み込みが中断されました: ${file.name}`)
        console.error('❌ FileReader aborted:', error)
        reportClientError(error, `FileReader aborted - File: ${file.name}`)
      }

      reader.readAsDataURL(file)

    } catch (error) {
      const fileError = error instanceof Error ? error : new Error('Unknown file processing error')
      console.error('❌ File processing error:', fileError)

      // Report error to centralized error reporting
      reportClientError(fileError, `File processing error - Files: ${acceptedFiles?.map(f => f.name).join(', ')}`)

      // Show user-friendly error message
      alert(`ファイルの処理に失敗しました: ${fileError.message}`)
    } finally {
      setCompressing(false)
    }
  }, [onChange])

  const removeImage = () => {
    try {
      console.log('🗑️ Removing uploaded image')

      // Clean up preview URL if it's a blob URL to prevent memory leaks
      if (preview && preview.startsWith('blob:')) {
        window.URL.revokeObjectURL(preview)
      }

      setPreview(null)
      setFileName(null)
      onChange(null)

      console.log('✅ Image removed successfully')
    } catch (error) {
      const removeError = error instanceof Error ? error : new Error('Unknown remove error')
      console.error('❌ Error removing image:', removeError)

      // Report error but don't block the operation
      reportClientError(removeError, 'Image removal error')

      // Still try to clear state even if there was an error
      setPreview(null)
      setFileName(null)
      onChange(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    onDropRejected: (fileRejections) => {
      try {
        console.log('📋 Files rejected:', fileRejections)

        const errors = fileRejections.map(rejection => {
          const file = rejection.file
          const errorCodes = rejection.errors.map(err => err.code)

          if (errorCodes.includes('file-too-large')) {
            return `${file.name}: ファイルサイズが大きすぎます`
          }
          if (errorCodes.includes('file-invalid-type')) {
            return `${file.name}: 対応していないファイル形式です`
          }
          if (errorCodes.includes('too-many-files')) {
            return '一度に選択できるファイルは1つだけです'
          }

          return `${file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
        })

        const errorMessage = errors.join('\n')
        alert(`ファイルの選択でエラーが発生しました:\n${errorMessage}`)

        // Report the rejection for analysis
        const rejectionError = new Error(`File rejection: ${errorMessage}`)
        reportClientError(rejectionError, `File rejection - ${fileRejections.length} files rejected`)

      } catch (error) {
        const rejectionError = error instanceof Error ? error : new Error('Unknown rejection handling error')
        console.error('❌ Error handling file rejections:', rejectionError)
        reportClientError(rejectionError, 'File rejection handling error')
        alert('ファイルの処理中にエラーが発生しました')
      }
    },
    onError: (error) => {
      const dropzoneError = error instanceof Error ? error : new Error('Dropzone error')
      console.error('❌ Dropzone error:', dropzoneError)
      reportClientError(dropzoneError, 'Dropzone error')
      alert(`ファイル選択機能でエラーが発生しました: ${dropzoneError.message}`)
    }
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

      {compressing ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-center text-muted-foreground">
              画像を圧縮しています...
            </p>
          </CardContent>
        </Card>
      ) : !preview ? (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
          }`}
          role="button"
          tabIndex={0}
          aria-label={`${label}をアップロード`}
          aria-describedby={helperText ? `${label}-helper` : undefined}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <input
              {...getInputProps()}
              aria-label={label}
              aria-required={required}
            />
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