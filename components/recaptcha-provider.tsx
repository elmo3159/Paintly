'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ReactNode } from 'react'

interface RecaptchaProviderProps {
  children: ReactNode
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // reCAPTCHAサイトキーが設定されていない場合は、プロバイダーなしで子要素を表示
  if (!siteKey) {
    console.warn('⚠️ reCAPTCHA site key is not configured. reCAPTCHA protection is disabled.')
    return <>{children}</>
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      container={{
        parameters: {
          badge: 'bottomright', // reCAPTCHAバッジの位置
          theme: 'light',
        },
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
