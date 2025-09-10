import imageCompression from 'browser-image-compression'

export interface ImageProcessingOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  maxIteration?: number
  fileType?: string
}

export async function compressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<File> {
  const defaultOptions: ImageProcessingOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    maxIteration: 10,
    fileType: file.type || 'image/jpeg',
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    return file // Return original file if compression fails
  }
}

export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type || 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          file.type || 'image/jpeg',
          0.95
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const base64 = reader.result as string
      // Remove data URL prefix
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to convert to base64'))
    }
    
    reader.readAsDataURL(file)
  })
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

export async function validateImage(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'ファイルサイズが大きすぎます（最大10MB）' }
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '対応していないファイル形式です' }
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file)
    if (dimensions.width < 100 || dimensions.height < 100) {
      return { valid: false, error: '画像が小さすぎます（最小100x100px）' }
    }
    if (dimensions.width > 8000 || dimensions.height > 8000) {
      return { valid: false, error: '画像が大きすぎます（最大8000x8000px）' }
    }
  } catch (error) {
    return { valid: false, error: '画像の読み込みに失敗しました' }
  }

  return { valid: true }
}

export async function processImageForUpload(file: File): Promise<{
  file: File
  base64: string
  dimensions: { width: number; height: number }
}> {
  // Validate image
  const validation = await validateImage(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Compress image if needed
  let processedFile = file
  if (file.size > 2 * 1024 * 1024) {
    processedFile = await compressImage(file)
  }

  // Get dimensions
  const dimensions = await getImageDimensions(processedFile)

  // Convert to base64
  const base64 = await convertToBase64(processedFile)

  return {
    file: processedFile,
    base64,
    dimensions
  }
}