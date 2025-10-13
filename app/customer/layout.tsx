import { Sidebar } from '@/components/sidebar'
import { TutorialModal } from '@/components/tutorial-modal'
import { TutorialProvider } from '@/hooks/use-tutorial'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TutorialProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
        <TutorialModal />
      </div>
    </TutorialProvider>
  )
}