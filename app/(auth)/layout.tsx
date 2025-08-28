import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              FlipFinder
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Swedish Marketplace Intelligence
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}