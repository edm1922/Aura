'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ErrorData {
  id: string
  message: string
  stack: string
  context: Record<string, any>
  severity: string
  url: string
  userAgent: string
  timestamp: string
  resolved: boolean
  resolvedAt: string | null
}

interface ErrorDashboardProps {
  errors: ErrorData[]
}

export default function ErrorDashboard({ errors }: ErrorDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all')
  const [selectedError, setSelectedError] = useState<ErrorData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter errors based on current filter and search query
  const filteredErrors = errors.filter(error => {
    // Filter by status
    if (filter === 'unresolved' && error.resolved) return false
    if (filter === 'resolved' && !error.resolved) return false
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        error.message.toLowerCase().includes(query) ||
        error.url.toLowerCase().includes(query) ||
        JSON.stringify(error.context).toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Group errors by message to find duplicates
  const errorGroups = filteredErrors.reduce((groups, error) => {
    const key = error.message
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(error)
    return groups
  }, {} as Record<string, ErrorData[]>)

  // Mark error as resolved
  const markAsResolved = async (errorId: string) => {
    try {
      const response = await fetch(`/api/error/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errorId }),
      })
      
      if (response.ok) {
        // Update the UI
        if (selectedError?.id === errorId) {
          setSelectedError({
            ...selectedError,
            resolved: true,
            resolvedAt: new Date().toISOString(),
          })
        }
        
        // Refresh the page to get updated data
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to mark error as resolved:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filters and search */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All Errors
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'unresolved'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Unresolved
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search errors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error list and details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-[500px]">
        {/* Error groups list */}
        <div className="col-span-1 border-r border-gray-100 overflow-y-auto max-h-[700px]">
          {Object.entries(errorGroups).length > 0 ? (
            Object.entries(errorGroups).map(([message, group]) => (
              <div
                key={message}
                onClick={() => setSelectedError(group[0])}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedError?.message === message ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 mr-2 ${
                      group.some(e => !e.resolved)
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {message.length > 60
                        ? `${message.substring(0, 60)}...`
                        : message}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>
                        {new Date(group[0].timestamp).toLocaleString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">
                        {group.length} occurrence{group.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {group[0].url && (
                      <div className="mt-1 text-xs text-gray-400 truncate">
                        {group[0].url}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No errors found matching your criteria.
            </div>
          )}
        </div>
        
        {/* Error details */}
        <div className="col-span-1 lg:col-span-2 p-6 overflow-y-auto max-h-[700px]">
          {selectedError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Error Details
                </h2>
                {!selectedError.resolved && (
                  <button
                    onClick={() => markAsResolved(selectedError.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      selectedError.resolved ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      selectedError.resolved
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedError.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                  {selectedError.resolved && selectedError.resolvedAt && (
                    <span className="text-sm text-gray-500 ml-2">
                      on {new Date(selectedError.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedError.message}
                </h3>
                
                <div className="text-sm text-gray-500 mb-4">
                  <div>
                    <strong>Occurred at:</strong>{' '}
                    {new Date(selectedError.timestamp).toLocaleString()}
                  </div>
                  {selectedError.url && (
                    <div>
                      <strong>URL:</strong> {selectedError.url}
                    </div>
                  )}
                  {selectedError.userAgent && (
                    <div>
                      <strong>User Agent:</strong> {selectedError.userAgent}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedError.stack && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Stack Trace
                  </h4>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs text-gray-800">
                    {selectedError.stack}
                  </pre>
                </div>
              )}
              
              {Object.keys(selectedError.context).length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">
                    Context
                  </h4>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs text-gray-800">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an error to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
