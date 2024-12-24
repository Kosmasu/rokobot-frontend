// components/AdminLayout.tsx
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    // Clear the admin_auth cookie
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#030E07]">
      <nav className="bg-[#051810] border-b border-[#1E755C]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary-light text-xl font-bold">Admin Panel</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/admin'
                      ? 'border-primary-light text-primary-light'
                      : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                  }`}
                >
                  Prompt Editor
                </Link>
                <Link
                  href="/admin/terrorizing-messages"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/admin/terrorizing-messages'
                      ? 'border-primary-light text-primary-light'
                      : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                  }`}
                >
                  Messages
                </Link>
                {/* Add more nav items here */}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">{children}</main>
    </div>
  )
}
