import type { Metadata } from 'next'
import { Nunito, Cormorant_Garamond, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import PageLoadingIndicator from '@/components/animations/PageLoadingIndicator'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import AppErrorBoundary from '@/components/error/AppErrorBoundary'
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor'

// Font configurations
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing-script',
})

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
    <html lang="en" className={`${nunito.variable} ${cormorantGaramond.variable} ${dancingScript.variable}`}>
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