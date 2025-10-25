import { RecaptchaProvider } from '@/components/recaptcha-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RecaptchaProvider>
      {children}
    </RecaptchaProvider>
  )
}
