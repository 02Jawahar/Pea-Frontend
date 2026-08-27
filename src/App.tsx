import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SkeletonCards } from '@/components/common/states'
import { AuthProvider } from '@/context/AuthContext'
import { UiProvider } from '@/context/UiContext'
import { router } from '@/routes'

export default function App() {
  return (
    <ErrorBoundary>
      <UiProvider>
        <AuthProvider>
          <Suspense fallback={<div className="p-6"><SkeletonCards /></div>}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </UiProvider>
    </ErrorBoundary>
  )
}
