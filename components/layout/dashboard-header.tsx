'use client';

import Link from 'next/link';
import useAuth from '@/hooks/use-auth';
import { LogoutButton } from '@/components/features/auth';
import { User } from '@/components/ui/icons';

export default function DashboardHeader() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FlipFinder
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/dashboard" className="px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Dashboard
            </Link>
            <Link href="/notifications" className="px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Notifications
            </Link>
            <Link href="/deals" className="px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Deals
            </Link>
            <Link href="/settings" className="px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Settings
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
            </div>

            {/* Logout button */}
            <LogoutButton variant="outline" size="sm">
              Sign out
            </LogoutButton>
          </div>
        </div>
      </div>
    </header>
  );
}