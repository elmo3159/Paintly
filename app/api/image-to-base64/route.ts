/**
 * 画像URLをBase64に変換するAPI Route
 * CORS問題を回避するため、サーバーサイドで画像を取得
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL parameter' },
        { status: 400 }
      )
    }

    // 相対パスの場合はローカルサーバーのURLに変換
    let fetchUrl = url
    if (url.startsWith('/')) {
      const host = request.headers.get('host') || 'localhost:3005'
      const protocol = host.includes('localhost') ? 'http' : 'https'
      fetchUrl = `${protocol}://${host}${url}`
    }

    // URLの検証（Supabase StorageまたはGemini APIまたはローカルサーバーのみ許可）
    const allowedDomains = [
      'supabase.co',
      'googleapis.com',
      'generativelanguage.googleapis.com',
      'localhost',
      '127.0.0.1'
    ]

    const urlObj = new URL(fetchUrl)
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain))

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'URL domain not allowed' },
        { status: 403 }
      )
    }

    // 画像を取得
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Paintly-PDF-Export/1.0'
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      )
    }

    // Blobに変換
    const blob = await response.blob()

    // ArrayBufferに変換してBase64エンコード
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // MIMEタイプを取得
    const mimeType = response.headers.get('content-type') || 'image/jpeg'

    // Data URLとして返す
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({
      success: true,
      dataUrl,
      mimeType
    })

  } catch (error) {
    console.error('Error in image-to-base64 API:', error)
    return NextResponse.json(
      {
        error: 'Failed to convert image to base64',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
