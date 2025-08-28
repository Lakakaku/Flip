'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { AlertCircle, ArrowLeft, RefreshCw } from '@/components/ui/icons';

// ============================================================================
// AUTH ERROR PAGE - Display authentication errors
// ============================================================================

export default function AuthErrorPage() {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const message = searchParams?.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else {
      setErrorMessage('An authentication error occurred.');
    }
  }, [searchParams]);

  const handleRetryLogin = () => {
    setIsLoading(true);
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    setIsLoading(true);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h2>

          {/* Error Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200 text-center">
              {errorMessage}
            </p>
          </div>

          {/* Common Error Solutions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Try the following:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Check that you allowed permission for the authentication provider</li>
              <li>• Ensure cookies are enabled in your browser</li>
              <li>• Try refreshing the page and logging in again</li>
              <li>• Clear your browser cache and try again</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRetryLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Home Page
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}