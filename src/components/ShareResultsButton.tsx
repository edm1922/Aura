'use client'

import { useState } from 'react'
import { CheckIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useNotification } from '@/context/NotificationContext'
import { handleApiError, formatError } from '@/lib/errorHandling'
import LoadingSpinner from '@/components/animations/LoadingSpinner'

interface ShareResultsButtonProps {
  testId: string
  onShare?: () => void
}

export default function ShareResultsButton({ testId, onShare }: ShareResultsButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const { showNotification } = useNotification()

  const handleShare = async () => {
    setIsSharing(true)

    try {
      // Generate a shareable link
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testId }),
      })

      if (!response.ok) {
        const errorMessage = await handleApiError(response)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const shareableUrl = `${window.location.origin}/shared/${data.shareId}`
      setShareUrl(shareableUrl)

      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Personality Test Results',
          text: 'Check out my personality test results!',
          url: shareableUrl,
        })
        showNotification('success', 'Results shared successfully!')
        if (onShare) onShare()
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(shareableUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        showNotification('success', 'Link copied to clipboard!')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = formatError(err)
        showNotification('error', `Failed to share results: ${errorMessage}`)
        console.error('Error sharing results:', err)
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        {isSharing ? (
          <span className="flex items-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Sharing...
          </span>
        ) : (
          <>
            {copied ? (
              <>
                <CheckIcon className="h-5 w-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ShareIcon className="h-5 w-5" />
                <span>Share Results</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  )
}
