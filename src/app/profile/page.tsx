import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Navigation from '@/components/Navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  // Fetch user's latest test result for theme customization
  const latestTestResult = await prisma.testResult.findFirst({
    where: {
      userId: session.user.id,
      // Only get completed tests (with a completedAt date)
      completedAt: {
        // Use a date far in the past to ensure we get any non-null date
        gte: new Date('2000-01-01'),
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
        <ProfileClient
          user={session.user}
          traits={latestTestResult?.traits as Record<string, number> || null}
        />
      </main>
    </div>
  )
}
