'use client';

/**
 * Social Login Component
 * Provides OAuth login options (Google, Facebook, etc.)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { getBrowserClient } from '@/lib/supabase/browser-client';

interface SocialLoginProps {
  redirectTo?: string;
  disabled?: boolean;
}

export default function SocialLogin({ redirectTo = '/dashboard', disabled = false }: SocialLoginProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setLoading(provider);
      const supabase = getBrowserClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Failed to login with ${provider}:`, error);
    } finally {
      setLoading(null);
    }
  };

  // Check which providers are enabled via environment variables
  const isGoogleEnabled = process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED === 'true';
  const isFacebookEnabled = process.env.NEXT_PUBLIC_SUPABASE_FACEBOOK_ENABLED === 'true';
  const isGitHubEnabled = process.env.NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED === 'true';

  // Don't render if no providers are enabled
  if (!isGoogleEnabled && !isFacebookEnabled && !isGitHubEnabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {isGoogleEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || loading !== null}
            onClick={() => handleSocialLogin('google')}
          >
            {loading === 'google' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        )}

        {isFacebookEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || loading !== null}
            onClick={() => handleSocialLogin('facebook')}
          >
            {loading === 'facebook' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.facebook className="mr-2 h-4 w-4" />
            )}
            Continue with Facebook
          </Button>
        )}

        {isGitHubEnabled && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || loading !== null}
            onClick={() => handleSocialLogin('github')}
          >
            {loading === 'github' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        )}
      </div>
    </div>
  );
}