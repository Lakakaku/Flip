'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuth from '@/hooks/use-auth';
import { 
  Button, 
  Input,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui';
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from '@/components/ui/icons';

// Schema for password reset form
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const password = watch('password');

  // Check if we have a valid token
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    if (type === 'recovery' && accessToken && refreshToken) {
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await updatePassword(data.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Password reset successful! You can now sign in with your new password.');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Verifying reset link...
          </p>
        </div>
        
        <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invalid reset link
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This password reset link is invalid or has expired
          </p>
        </div>
        
        <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Link expired or invalid
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Password reset links expire after 1 hour for security. Please request a new one.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full">
                  Request new reset link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Password reset successful
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your password has been updated
          </p>
        </div>
        
        <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                All done!
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to sign in page in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create new password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choose a strong password for your account
        </p>
      </div>
      
      <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* New Password Field */}
          <FormItem>
            <FormLabel>New password</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  error={!!errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </FormControl>
            <FormMessage error={errors.password} />
            {password && !errors.password && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Password meets requirements
              </p>
            )}
          </FormItem>

          {/* Confirm Password Field */}
          <FormItem>
            <FormLabel>Confirm new password</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </FormControl>
            <FormMessage error={errors.confirmPassword} />
          </FormItem>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>

        {/* Back to login link */}
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}