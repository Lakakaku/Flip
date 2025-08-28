'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/use-auth';
import { Button } from '@/components/ui';
import { Loader2 } from '@/components/ui/icons';

interface LogoutButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  redirectTo?: string;
}

export default function LogoutButton({ 
  children = 'Sign out',
  variant = 'ghost',
  size = 'sm',
  className,
  redirectTo = '/login'
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await logout();
      router.push(redirectTo);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout fails
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        children
      )}
    </Button>
  );
}