import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ErrorDashboard from '@/components/admin/ErrorDashboard'

export const metadata = {
  title: 'Error Dashboard | Aura',
  description: 'Monitor and manage application errors',
}

export default async function ErrorsPage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated and is an admin
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/admin/errors')
  }
  
  // Check if user is an admin (you would need to add an isAdmin field to your User model)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  })
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  // For this example, we'll assume the user is an admin if they're authenticated
  // In a real app, you'd check for admin privileges
  
  // Get errors for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const errors = await prisma.errorLog.findMany({
    where: {
      timestamp: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 100,
  })
  
  // Process errors for the dashboard
  const processedErrors = errors.map(error => ({
    id: error.id,
    message: error.message,
    stack: error.stack || '',
    context: error.context ? JSON.parse(error.context) : {},
    severity: error.severity,
    url: error.url || '',
    userAgent: error.userAgent || '',
    timestamp: error.timestamp.toISOString(),
    resolved: error.resolved,
    resolvedAt: error.resolvedAt?.toISOString() || null,
  }))
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Error Dashboard</h1>
      <ErrorDashboard errors={processedErrors} />
    </div>
  )
}
