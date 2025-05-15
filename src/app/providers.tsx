'use client'

import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/context/NotificationContext'
import { OnboardingProvider } from '@/context/OnboardingContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { MoodAdaptiveProvider } from '@/context/MoodAdaptiveContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <OnboardingProvider>
          <ThemeProvider>
            <MoodAdaptiveProvider>
              {children}
            </MoodAdaptiveProvider>
          </ThemeProvider>
        </OnboardingProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}