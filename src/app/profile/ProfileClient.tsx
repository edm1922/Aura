'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/context/NotificationContext'
import { useTheme } from '@/context/ThemeContext'
import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import ThemeCustomizer from '@/components/profile/ThemeCustomizer'
import AuraBadge from '@/components/profile/AuraBadge'
import LoadingButton from '@/components/LoadingButton'

interface ProfileClientProps {
  user: {
    id?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
  traits: Record<string, number> | null
}

export default function ProfileClient({ user, traits }: ProfileClientProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { showNotification } = useNotification()
  const { theme, updateThemeFromTraits } = useTheme()

  const [name, setName] = useState(user.name || '')
  const [isUpdating, setIsUpdating] = useState(false)

  // Apply theme from traits when component mounts
  useState(() => {
    if (traits) {
      updateThemeFromTraits(traits)
    }
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showNotification('error', 'Name cannot be empty')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
        },
      })

      showNotification('success', 'Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('error', 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <PageTransition>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Information */}
          <div className="md:w-2/3">
            <FadeIn>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <AuraBadge size="md" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.name || 'User'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: theme.primary }}>
                      {theme.name}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <LoadingButton
                      type="submit"
                      isLoading={isUpdating}
                      loadingText="Updating..."
                    >
                      Update Profile
                    </LoadingButton>
                  </div>
                </form>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Account Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Password
                    </h3>
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary-dark"
                      onClick={() => showNotification('info', 'Password reset functionality coming soon')}
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => showNotification('info', 'Account deletion functionality coming soon')}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Theme Customization */}
          <div className="md:w-1/3">
            <FadeIn delay={0.2}>
              <ThemeCustomizer traits={traits || undefined} />
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
