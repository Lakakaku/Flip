'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators';
import useAuth from '@/hooks/use-auth';
import { 
  Button, 
  Input,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui';
import { Loader2, Mail, ArrowRight, CheckCircle } from '@/components/ui/icons';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(data.email);
      setEmailAddress(data.email);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent password reset instructions
          </p>
        </div>
        
        <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Email sent successfully
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent password reset instructions to:
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {emailAddress}
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Check your email and follow the instructions to reset your password.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => setEmailSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Try another email
              </Button>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email to receive reset instructions
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

          {/* Email Field */}
          <FormItem>
            <FormLabel>Email address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10"
                  error={!!errors.email}
                  {...register('email')}
                />
              </div>
            </FormControl>
            <FormMessage error={errors.email} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll send reset instructions to this email address
            </p>
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
                Sending instructions...
              </>
            ) : (
              <>
                Send reset instructions
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
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