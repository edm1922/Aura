'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams object to modify
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page, last page, current page, and pages adjacent to current page
      pageNumbers.push(1)

      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      // Add ellipsis if there's a gap between first page and startPage
      if (startPage > 2) {
        pageNumbers.push('...')
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if there's a gap between endPage and last page
      if (endPage < totalPages - 1) {
        pageNumbers.push('...')
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-6">
      <div className="-mt-px flex w-0 flex-1">
        {currentPage > 1 ? (
          <Link
            href={createPageURL(currentPage - 1)}
            className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <ChevronLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-300 cursor-not-allowed">
            <ChevronLeftIcon className="mr-3 h-5 w-5 text-gray-300" aria-hidden="true" />
            Previous
          </span>
        )}
      </div>
      <div className="hidden md:-mt-px md:flex">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
              >
                ...
              </span>
            )
          }

          return page === currentPage ? (
            <span
              key={page}
              className="inline-flex items-center border-t-2 border-blue-500 px-4 pt-4 text-sm font-medium text-blue-600"
              aria-current="page"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={createPageURL(page)}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              {page}
            </Link>
          )
        })}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage < totalPages ? (
          <Link
            href={createPageURL(currentPage + 1)}
            className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Next
            <ChevronRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-300 cursor-not-allowed">
            Next
            <ChevronRightIcon className="ml-3 h-5 w-5 text-gray-300" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  )
}
