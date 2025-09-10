export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check every hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    })
  }
}

export function checkInstallPrompt() {
  if (typeof window === 'undefined') return

  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Show install button
    const installButton = document.getElementById('install-pwa')
    if (installButton) {
      installButton.style.display = 'block'
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          console.log(`User response to the install prompt: ${outcome}`)
          deferredPrompt = null
        }
      })
    }
  })

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    deferredPrompt = null
  })
}

export async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Notification permission granted')
      
      // Subscribe to push notifications
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          )
        })
        
        // Send subscription to server
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription)
        })
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error)
      }
    }
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

export function checkOnlineStatus() {
  if (typeof window === 'undefined') return

  const updateOnlineStatus = () => {
    const statusElement = document.getElementById('online-status')
    if (statusElement) {
      if (navigator.onLine) {
        statusElement.style.display = 'none'
      } else {
        statusElement.style.display = 'block'
        statusElement.textContent = 'オフライン - 接続が回復するまでお待ちください'
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Initial check
  updateOnlineStatus()
}