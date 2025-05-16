'use client'

import { Fragment, useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import AuraBadge from './profile/AuraBadge'

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [hasTestResults, setHasTestResults] = useState(false)

  // Check if user has test results for badge display
  useEffect(() => {
    const checkTestResults = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/test/latest')
          if (response.ok) {
            setHasTestResults(true)
          }
        } catch (error) {
          console.error('Error checking test results:', error)
        }
      }
    }

    checkTestResults()
  }, [session?.user?.id])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Take Test', href: '/test' },
    { name: 'History', href: '/test/history' },
    { name: 'Progress', href: '/progress' },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Aura
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  {hasTestResults ? (
                    <AuraBadge size="sm" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <Link
                          href="/profile"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-100' : ''
                          } text-gray-700`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={() => signOut()}
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            active ? 'bg-gray-100' : ''
                          } text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}