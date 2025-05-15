import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import TestForm from './TestForm'

export default async function NewTest() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/test/new')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Personality Assessment
          </h1>
          <p className="text-gray-600 mb-8">
            Answer the following questions honestly to get an accurate assessment of your personality traits.
            There are no right or wrong answers, just choose what best describes you.
          </p>
          
          <TestForm />
        </div>
      </main>
    </div>
  )
}
