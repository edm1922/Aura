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
  description: 'Discover your personality through AI-powered assessment and visualize your unique aura.',
  keywords: 'personality test, AI, aura, personality traits, self-discovery, psychology',
  authors: [{ name: 'Aura Team' }],
  creator: 'Aura Team',
  publisher: 'Aura',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://aura-edm1922.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Aura Personality Test',
    description: 'Discover your personality through AI-powered assessment and visualize your unique aura.',
    url: 'https://aura-edm1922.vercel.app',
    siteName: 'Aura Personality Test',
    images: [
      {
        url: '/images/aura-social-share.jpg',
        width: 1200,
        height: 630,
        alt: 'Aura Personality Test',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Personality Test',
    description: 'Discover your personality through AI-powered assessment and visualize your unique aura.',
    images: ['/images/aura-social-share.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
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