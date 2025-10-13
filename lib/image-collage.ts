/**
 * Canvas APIを使用して複数の画像を1枚のコラージュ画像に結合
 */

export interface CollageOptions {
  images: string[] // 画像URLの配列
  maxWidth?: number // 最大幅（デフォルト: 1200px）
  spacing?: number // 画像間のスペース（デフォルト: 20px）
  backgroundColor?: string // 背景色（デフォルト: 白）
}

/**
 * 画像URLを読み込んでImageオブジェクトを作成
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // CORS対応
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

/**
 * 画像を指定サイズにリサイズ
 */
const resizeImage = (
  img: HTMLImageElement,
  maxWidth: number
): { width: number; height: number } => {
  const aspectRatio = img.height / img.width
  const width = Math.min(img.width, maxWidth)
  const height = width * aspectRatio
  return { width, height }
}

/**
 * 複数の画像を縦に並べて1枚のコラージュ画像を生成
 */
export const createImageCollage = async (
  options: CollageOptions
): Promise<Blob> => {
  const {
    images,
    maxWidth = 1200,
    spacing = 20,
    backgroundColor = '#ffffff'
  } = options

  if (images.length === 0) {
    throw new Error('At least one image is required')
  }

  try {
    // すべての画像を読み込み
    const loadedImages = await Promise.all(images.map(loadImage))

    // 各画像のリサイズ後のサイズを計算
    const imageSizes = loadedImages.map(img => resizeImage(img, maxWidth))

    // キャンバスの総サイズを計算
    const canvasWidth = maxWidth
    const canvasHeight =
      imageSizes.reduce((total, size) => total + size.height, 0) +
      spacing * (images.length + 1) // 上下と画像間のスペース

    // キャンバスを作成
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // 背景色を塗りつぶし
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 画像を縦に配置
    let currentY = spacing
    loadedImages.forEach((img, index) => {
      const { width, height } = imageSizes[index]
      const x = (canvasWidth - width) / 2 // 中央配置

      // 画像を描画
      ctx.drawImage(img, x, currentY, width, height)

      // 次の画像の位置を計算
      currentY += height + spacing
    })

    // BlobとしてエクスポートJPEG形式、品質90%）
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        },
        'image/jpeg',
        0.9
      )
    })
  } catch (error) {
    console.error('Error creating image collage:', error)
    throw error
  }
}

/**
 * グリッドレイアウトで画像を配置（横2列）
 */
export const createImageCollageGrid = async (
  options: CollageOptions
): Promise<Blob> => {
  const {
    images,
    maxWidth = 1200,
    spacing = 20,
    backgroundColor = '#ffffff'
  } = options

  if (images.length === 0) {
    throw new Error('At least one image is required')
  }

  try {
    // すべての画像を読み込み
    const loadedImages = await Promise.all(images.map(loadImage))

    // グリッド計算（2列）
    const columns = 2
    const rows = Math.ceil(loadedImages.length / columns)
    const cellWidth = (maxWidth - spacing * (columns + 1)) / columns

    // 各画像をセルサイズにリサイズ
    const imageSizes = loadedImages.map(img => {
      const aspectRatio = img.height / img.width
      const width = cellWidth
      const height = width * aspectRatio
      return { width, height }
    })

    // 各行の最大高さを計算
    const rowHeights: number[] = []
    for (let row = 0; row < rows; row++) {
      const rowImages = imageSizes.slice(row * columns, (row + 1) * columns)
      const maxHeight = Math.max(...rowImages.map(size => size.height))
      rowHeights.push(maxHeight)
    }

    // キャンバスの総サイズを計算
    const canvasWidth = maxWidth
    const canvasHeight =
      rowHeights.reduce((total, height) => total + height, 0) +
      spacing * (rows + 1)

    // キャンバスを作成
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // 背景色を塗りつぶし
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 画像をグリッドに配置
    let currentY = spacing
    loadedImages.forEach((img, index) => {
      const row = Math.floor(index / columns)
      const col = index % columns
      const { width, height } = imageSizes[index]

      const x = spacing + col * (cellWidth + spacing)
      const y = currentY + (row > 0 ? rowHeights.slice(0, row).reduce((a, b) => a + b + spacing, 0) : 0)

      // 画像を描画（セル内で中央配置）
      ctx.drawImage(img, x, y, width, height)
    })

    // Blobとしてエクスポート（JPEG形式、品質90%）
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        },
        'image/jpeg',
        0.9
      )
    })
  } catch (error) {
    console.error('Error creating image collage grid:', error)
    throw error
  }
}
