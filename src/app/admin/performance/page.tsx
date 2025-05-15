import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import PerformanceDashboard from '@/components/admin/PerformanceDashboard'

export const metadata = {
  title: 'Performance Dashboard | Aura',
  description: 'Monitor application performance metrics',
}

export default async function PerformancePage() {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated and is an admin
  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/admin/performance')
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
  
  // Get performance metrics for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const metrics = await prisma.performanceMetric.findMany({
    where: {
      timestamp: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })
  
  // Process metrics for the dashboard
  const processedMetrics = metrics.map(metric => ({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    tags: JSON.parse(metric.tags),
    timestamp: metric.timestamp.toISOString(),
  }))
  
  // Group metrics by name
  const metricsByName = processedMetrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = []
    }
    acc[metric.name].push(metric)
    return acc
  }, {} as Record<string, typeof processedMetrics>)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Dashboard</h1>
      <PerformanceDashboard metrics={metricsByName} />
    </div>
  )
}
