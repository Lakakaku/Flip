'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import useAuth from '@/hooks/use-auth';
import { 
  Button, 
  Input,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui';
import { Eye, EyeOff, Loader2, Mail, Lock } from '@/components/ui/icons';
import SocialLogin from './social-login';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Login */}
      <SocialLogin 
        mode="login" 
        redirectTo={redirectTo}
      />

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
              placeholder="Enter your password"
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
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
      </form>
    </div>
  );
}