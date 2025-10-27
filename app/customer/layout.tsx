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
      <div className="fixed inset-0 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        <TutorialModal />
      </div>
    </TutorialProvider>
  )
}