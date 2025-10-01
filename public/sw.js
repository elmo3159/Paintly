// Service Worker for Paintly PWA - Enhanced Version
const CACHE_VERSION = '2025.1.1'
const STATIC_CACHE = `paintly-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `paintly-dynamic-${CACHE_VERSION}`
const IMAGES_CACHE = `paintly-images-${CACHE_VERSION}`
const API_CACHE = `paintly-api-${CACHE_VERSION}`

const OFFLINE_URL = '/offline.html'
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 24 * 60 * 60 * 1000,    // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000               // 5 minutes
}

// Essential static assets for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
  '/icon-96.png',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  '/manifest.json'
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    (async () => {
      try {
        // Cache static assets
        const staticCache = await caches.open(STATIC_CACHE)
        await staticCache.addAll(STATIC_ASSETS)
        
        // Initialize other caches
        await caches.open(DYNAMIC_CACHE)
        await caches.open(IMAGES_CACHE)
        await caches.open(API_CACHE)
        
        console.log('✅ Service Worker installed successfully')
        await self.skipWaiting()
      } catch (error) {
        console.error('❌ Service Worker installation failed:', error)
      }
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGES_CACHE, API_CACHE]
        
        // Delete old caches
        await Promise.all(
          cacheNames
            .filter(cacheName => !validCaches.includes(cacheName))
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
        
        // Take control of all pages
        await self.clients.claim()
        console.log('✅ Service Worker activated successfully')
      } catch (error) {
        console.error('❌ Service Worker activation failed:', error)
      }
    })()
  )
})

// Enhanced fetch handler with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle different request types with optimized strategies
  if (request.mode === 'navigate') {
    // Navigation requests - Network first with fast fallback
    event.respondWith(handleNavigationRequest(request))
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with smart caching
    event.respondWith(handleApiRequest(request))
  } else if (isImageRequest(request)) {
    // Images - Cache first with network fallback
    event.respondWith(handleImageRequest(request))
  } else if (isStaticAsset(request)) {
    // Static assets - Cache first
    event.respondWith(handleStaticAssetRequest(request))
  } else {
    // Other requests - Stale while revalidate
    event.respondWith(handleDynamicRequest(request))
  }
})

// Navigation request handler - Network first strategy
async function handleNavigationRequest(request) {
  try {
    // Try preloaded response first
    const preloadResponse = await event.preloadResponse
    if (preloadResponse) {
      return preloadResponse
    }
    
    // Try network with timeout
    const networkResponse = await fetchWithTimeout(request, 3000)
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📱 Navigation offline, serving cached version')
    
    // Try cache first
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to offline page
    const offlineCache = await caches.open(STATIC_CACHE)
    return await offlineCache.match(OFFLINE_URL)
  }
}

// API request handler - Network first with intelligent caching
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    const networkResponse = await fetchWithTimeout(request, 8000)
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      // Add timestamp for cache invalidation
      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers),
          'sw-cached-at': Date.now().toString()
        }
      })
      cache.put(request, responseToCache)
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 API offline, checking cache...')
    
    // Try cached version for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request)
      if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.API)) {
        console.log('📦 Serving cached API response')
        return cachedResponse
      }
    }
    
    // For POST requests, queue for background sync
    if (request.method === 'POST') {
      await queueBackgroundSync(request)
      return new Response(JSON.stringify({
        error: 'オフラインです。オンラインになったら自動的に送信されます。',
        queued: true
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Image request handler - Cache first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_DURATION.IMAGES)) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache with timestamp
      const responseToCache = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers),
          'sw-cached-at': Date.now().toString()
        }
      })
      cache.put(request, responseToCache)
    }
    
    return networkResponse
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Static asset handler - Cache first
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

// Dynamic request handler - Stale while revalidate
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  
  const cachedResponse = await cache.match(request)
  
  // Return cached response immediately
  if (cachedResponse) {
    // Update in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse)
      }
    }).catch(() => {}) // Ignore network errors for background updates
    
    return cachedResponse
  }
  
  // No cache, try network
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

// Enhanced background sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-generations') {
    event.waitUntil(syncPendingGenerations())
  } else if (event.tag === 'sync-api-calls') {
    event.waitUntil(syncPendingApiCalls())
  }
})

// Sync pending image generations
async function syncPendingGenerations() {
  try {
    const pendingGenerations = await getStoredData('pending-generations')
    
    for (const generation of pendingGenerations) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: generation.formData
        })
        
        if (response.ok) {
          await removeStoredData('pending-generations', generation.id)
          
          // Notify user of successful generation
          await self.registration.showNotification('Paintly', {
            body: '画像生成が完了しました',
            icon: '/icon-192.png',
            badge: '/icon-96.png',
            tag: 'generation-complete',
            data: { generationId: generation.id }
          })
        }
      } catch (error) {
        console.error('Failed to sync generation:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('📧 Push notification received')
  
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'シミュレーションが完了しました',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      ...data,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view', title: '表示', icon: '/icon-96.png' },
      { action: 'dismiss', title: '閉じる', icon: '/icon-96.png' }
    ],
    requireInteraction: true,
    tag: data.tag || 'paintly-notification'
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Paintly', options)
  )
})

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const data = event.notification.data || {}
  
  if (event.action === 'view') {
    const url = data.url || '/dashboard'
    event.waitUntil(
      clients.openWindow(url).catch(() => {
        // Fallback if opening window fails
        return clients.matchAll().then(clients => {
          if (clients.length > 0) {
            return clients[0].focus()
          }
        })
      })
    )
  }
})

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCaches())
  }
})

// Utility functions

function fetchWithTimeout(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ])
}

function isImageRequest(request) {
  const url = new URL(request.url)
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname) ||
         request.headers.get('accept')?.includes('image/')
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         STATIC_ASSETS.includes(url.pathname)
}

function isCacheExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at')
  if (!cachedAt) return false
  return Date.now() - parseInt(cachedAt) > maxAge
}

async function queueBackgroundSync(request) {
  try {
    const formData = await request.formData()
    const queueItem = {
      id: Date.now().toString(),
      url: request.url,
      method: request.method,
      formData: formData,
      timestamp: Date.now()
    }
    
    await storeData('pending-generations', queueItem)
    
    // Register for background sync
    await self.registration.sync.register('sync-generations')
  } catch (error) {
    console.error('Failed to queue background sync:', error)
  }
}

async function storeData(key, data) {
  const stored = await getStoredData(key)
  stored.push(data)
  
  const cache = await caches.open(DYNAMIC_CACHE)
  const response = new Response(JSON.stringify(stored))
  await cache.put(new Request(`/sw-storage/${key}`), response)
}

async function getStoredData(key) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const response = await cache.match(`/sw-storage/${key}`)
    if (response) {
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to get stored data:', error)
  }
  return []
}

async function removeStoredData(key, id) {
  const stored = await getStoredData(key)
  const updated = stored.filter(item => item.id !== id)
  
  const cache = await caches.open(DYNAMIC_CACHE)
  const response = new Response(JSON.stringify(updated))
  await cache.put(new Request(`/sw-storage/${key}`), response)
}

async function cleanupExpiredCaches() {
  const cacheNames = [DYNAMIC_CACHE, IMAGES_CACHE, API_CACHE]
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response && isCacheExpired(response, CACHE_DURATION.DYNAMIC)) {
        await cache.delete(request)
      }
    }
  }
}

console.log('🎨 Paintly Service Worker loaded - Enhanced Version', CACHE_VERSION)