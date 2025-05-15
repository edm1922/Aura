'use client'

import Skeleton from '@/components/animations/Skeleton'

export default function ResultsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton width="250px" height="36px" />
        <Skeleton width="120px" height="40px" variant="rectangular" />
      </div>

      {/* Trait Scores */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <Skeleton width="150px" height="24px" className="mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton width="100px" height="20px" />
                <Skeleton width="40px" height="20px" />
              </div>
              <Skeleton height="10px" className="rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <Skeleton width="180px" height="24px" className="mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Skeleton width="8px" height="8px" variant="circular" className="mt-2" />
              <Skeleton height="20px" className="flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Test Completion Date */}
      <div className="mt-8 text-center">
        <Skeleton width="200px" height="20px" className="mx-auto" />
      </div>
    </div>
  )
}
