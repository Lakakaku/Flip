'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import useAuth from '@/hooks/use-auth';
import { 
  Button, 
  Input, 
  Label, 
  Checkbox, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui';
import { Eye, EyeOff, Loader2, Mail, Lock } from '@/components/ui/icons';
import SocialLogin from '@/components/features/auth/social-login';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser(data.email, data.password);
      // Redirect to dashboard or login
      router.push('/login?message=Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start finding profitable flips today
        </p>
      </div>
      
      <div className="rounded-lg bg-white dark:bg-gray-800 px-6 py-8 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Social Login */}
        <SocialLogin 
          mode="register" 
          redirectTo="/dashboard?welcome=true"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Display error message */}
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
                  placeholder="Enter your email"
                  className="pl-10"
                  error={!!errors.email}
                  {...register('email')}
                />
              </div>
            </FormControl>
            <FormMessage error={errors.email} />
          </FormItem>

          {/* Password Field */}
          <FormItem>
            <FormLabel>Password</FormLabel>
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
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
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

          {/* Terms Agreement */}
          <FormItem>
            <div className="flex items-start space-x-2">
              <Checkbox
                {...register('agreedToTerms')}
                aria-describedby="terms-error"
              />
              <div className="space-y-1 leading-none">
                <Label className="text-sm font-normal">
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link 
                    href="/privacy" 
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
            <FormMessage error={errors.agreedToTerms} />
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}