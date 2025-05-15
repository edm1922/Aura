import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navigation from '@/components/Navigation'
import DashboardClient from './DashboardClient'
import MoodAdaptiveBackground from '@/components/ui/MoodAdaptiveBackground'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return (
    <MoodAdaptiveBackground className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardClient />
      </main>
    </MoodAdaptiveBackground>
  )
}