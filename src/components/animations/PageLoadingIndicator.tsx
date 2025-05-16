'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

// Inner component that uses useSearchParams
function PageLoadingIndicatorInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // When the route changes, show the loading indicator
    setIsLoading(true)

    // After a short delay, hide the loading indicator
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <motion.div
        className="h-full bg-blue-600"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Wrapper component with Suspense boundary
export default function PageLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <PageLoadingIndicatorInner />
    </Suspense>
  )
}
