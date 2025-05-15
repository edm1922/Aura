import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { getUserTestHistory } from '@/lib/db-utils'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import Pagination from '@/components/Pagination'

interface TestHistoryPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function TestHistoryPage({ searchParams }: TestHistoryPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/test/history')
  }

  // Get the current page from the URL or default to 1
  const currentPage = searchParams?.page ? parseInt(searchParams.page, 10) : 1

  // Fetch user's test history with pagination
  const { results: testResults, pagination } = await getUserTestHistory(
    session.user.id,
    currentPage,
    10, // 10 items per page
    'desc' // newest first
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="px-4 py-6 sm:px-0">
            <FadeIn>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Test History</h1>
                <Link
                  href="/test"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Take New Test
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {testResults.length > 0 ? (
                    testResults.map((test) => (
                      <li key={test.id}>
                        <Link
                          href={`/results/${test.id}`}
                          className="block hover:bg-gray-50"
                        >
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                Personality Assessment
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {Object.keys((test.traits as any) || {}).length} traits analyzed
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  Completed on{' '}
                                  {new Date(test.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-6 text-center text-gray-500">
                      You haven't taken any tests yet. Click "Take New Test" to get started.
                    </li>
                  )}
                </ul>
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="mt-6">
                  <Pagination
                    totalPages={pagination.pages}
                    currentPage={pagination.page}
                  />
                </div>
              )}
            </FadeIn>
          </div>
        </PageTransition>
      </main>
    </div>
  )
}
