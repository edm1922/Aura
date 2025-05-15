'use client'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface FormErrorProps {
  error?: string | null
  className?: string
}

export default function FormError({ error, className = '' }: FormErrorProps) {
  if (!error) return null

  return (
    <div className={`text-sm text-red-600 mt-1 flex items-start gap-1 ${className}`}>
      <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  )
}
