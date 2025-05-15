import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Navigation from '@/components/Navigation'
import ProgressClient from './ProgressClient'

export default async function ProgressPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/progress')
  }

  // Fetch user's latest test result for aura visualization
  const latestTestResult = await prisma.testResult.findFirst({
    where: {
      userId: session.user.id,
      completedAt: {
        lt: new Date(2100, 0, 1), // Any date in the future
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    select: {
      traits: true,
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ProgressClient
          userId={session.user.id}
          traits={latestTestResult?.traits as Record<string, number> || null}
        />
      </main>
    </div>
  )
}
