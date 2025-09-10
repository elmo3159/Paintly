const CACHE_NAME = 'paintly-v1'
const OFFLINE_URL = '/offline.html'

// Cache assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll([
        '/',
        '/offline.html',
        '/icon-192.png',
        '/icon-512.png',
      ])
      await self.skipWaiting()
    })()
  )
})

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
      await self.clients.claim()
    })()
  )
})

// Network-first strategy for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse
          if (preloadResponse) {
            return preloadResponse
          }
          return await fetch(event.request)
        } catch (error) {
          const cache = await caches.open(CACHE_NAME)
          return await cache.match(OFFLINE_URL)
        }
      })()
    )
  } else if (event.request.url.includes('/api/')) {
    // Network-first for API calls
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request)
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            await cache.put(event.request, response.clone())
          }
          return response
        } catch (error) {
          const cache = await caches.open(CACHE_NAME)
          const cachedResponse = await cache.match(event.request)
          if (cachedResponse) {
            return cachedResponse
          }
          throw error
        }
      })()
    )
  } else {
    // Cache-first for assets
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }
        try {
          const response = await fetch(event.request)
          if (response.ok && event.request.method === 'GET') {
            await cache.put(event.request, response.clone())
          }
          return response
        } catch (error) {
          return new Response('オフラインです', { status: 503 })
        }
      })()
    )
  }
})

// Background sync for offline image generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-generations') {
    event.waitUntil(syncGenerations())
  }
})

async function syncGenerations() {
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  const pendingRequests = requests.filter(req => 
    req.url.includes('/api/generate') && req.method === 'POST'
  )
  
  for (const request of pendingRequests) {
    try {
      const response = await fetch(request)
      if (response.ok) {
        await cache.delete(request)
      }
    } catch (error) {
      console.error('Sync failed for', request.url)
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'シミュレーションが完了しました',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: '表示', icon: '/icon-96.png' },
      { action: 'close', title: '閉じる', icon: '/icon-96.png' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Paintly', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})