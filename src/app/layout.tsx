import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import PageLoadingIndicator from '@/components/animations/PageLoadingIndicator'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import AppErrorBoundary from '@/components/error/AppErrorBoundary'
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor'

// Instead of using next/font/google, we'll use CSS imports in globals.css

export const metadata: Metadata = {
  title: 'Aura Personality Test',
  description: 'Discover your personality through AI-powered assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-text min-h-screen font-sans">
        <Providers>
          <PageLoadingIndicator />
          <OnboardingContainer />
          <PerformanceMonitor />
          <AppErrorBoundary>
            {children}
          </AppErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}