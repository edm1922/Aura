'use client'

import { useEffect } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { initErrorTracking } from '@/lib/error-tracking'
import { initPerformanceMonitoring } from '@/lib/performance'

export default function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  // Initialize error tracking and performance monitoring
  useEffect(() => {
    initErrorTracking()
    initPerformanceMonitoring()
  }, [])

  return (
    <ErrorBoundary
      name="root"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-serif font-medium text-primary-dark mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Refresh the page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
