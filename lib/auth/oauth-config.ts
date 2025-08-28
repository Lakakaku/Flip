// ============================================================================
// OAUTH CONFIGURATION - Provider settings and environment validation
// ============================================================================
// Central configuration for OAuth providers to ensure consistency across the app
// Validates environment variables and provides provider-specific settings
// ============================================================================

import type { OAuthProvider } from './index';

// ============================================================================
// OAUTH PROVIDER CONFIGURATIONS
// ============================================================================

export interface OAuthProviderConfig {
  provider: OAuthProvider;
  name: string;
  enabled: boolean;
  scopes?: string;
  requiresEnvVar?: string;
  developmentOnly?: boolean;
  productionOnly?: boolean;
}

export const oauthProviders: OAuthProviderConfig[] = [
  {
    provider: 'google',
    name: 'Google',
    enabled: true,
    scopes: 'email profile',
    requiresEnvVar: 'NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED',
    developmentOnly: false,
    productionOnly: false,
  },
  {
    provider: 'facebook',
    name: 'Facebook',
    enabled: true,
    scopes: 'email',
    requiresEnvVar: 'NEXT_PUBLIC_SUPABASE_FACEBOOK_ENABLED',
    developmentOnly: false,
    productionOnly: false,
  },
  {
    provider: 'github',
    name: 'GitHub',
    enabled: false, // Disabled for now - enable when configured in Supabase
    scopes: 'user:email',
    requiresEnvVar: 'NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED',
    developmentOnly: true,
    productionOnly: false,
  },
  {
    provider: 'apple',
    name: 'Apple',
    enabled: false, // Disabled for now - enable when configured in Supabase
    scopes: 'name email',
    requiresEnvVar: 'NEXT_PUBLIC_SUPABASE_APPLE_ENABLED',
    developmentOnly: false,
    productionOnly: true,
  },
];

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Check if an OAuth provider is enabled based on environment and configuration
 */
export function isOAuthProviderEnabled(provider: OAuthProvider): boolean {
  const config = oauthProviders.find(p => p.provider === provider);
  if (!config || !config.enabled) {
    return false;
  }

  // Check environment restrictions
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (config.developmentOnly && !isDevelopment) {
    return false;
  }

  if (config.productionOnly && !isProduction) {
    return false;
  }

  // Check if required environment variable is set (if specified)
  if (config.requiresEnvVar) {
    const envValue = process.env[config.requiresEnvVar];
    if (!envValue || envValue.toLowerCase() !== 'true') {
      return false;
    }
  }

  return true;
}

/**
 * Get all enabled OAuth providers for the current environment
 */
export function getEnabledOAuthProviders(): OAuthProviderConfig[] {
  return oauthProviders.filter(config => isOAuthProviderEnabled(config.provider));
}

/**
 * Get configuration for a specific OAuth provider
 */
export function getOAuthProviderConfig(provider: OAuthProvider): OAuthProviderConfig | null {
  return oauthProviders.find(p => p.provider === provider) || null;
}

// ============================================================================
// REDIRECT URL HELPERS
// ============================================================================

/**
 * Get the OAuth callback URL for the current environment
 */
export function getOAuthCallbackUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  
  // Server-side fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                  'http://localhost:3000';
  
  return `${baseUrl}/auth/callback`;
}

/**
 * Generate provider-specific redirect URL with query parameters
 */
export function generateOAuthRedirectUrl(
  provider: OAuthProvider,
  options: {
    next?: string;
    mode?: 'login' | 'register';
    [key: string]: any;
  } = {}
): string {
  const baseUrl = getOAuthCallbackUrl();
  const url = new URL(baseUrl);
  
  // Add provider information
  url.searchParams.set('provider', provider);
  
  // Add optional parameters
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate OAuth configuration on app startup
 */
export function validateOAuthConfiguration(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check basic Supabase configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  
  // Check enabled providers
  const enabledProviders = getEnabledOAuthProviders();
  
  if (enabledProviders.length === 0) {
    warnings.push('No OAuth providers are enabled. Users can only sign in with email/password.');
  }
  
  // Check each enabled provider
  enabledProviders.forEach(config => {
    if (config.requiresEnvVar && !process.env[config.requiresEnvVar]) {
      warnings.push(
        `OAuth provider '${config.name}' is enabled but missing environment variable: ${config.requiresEnvVar}`
      );
    }
  });
  
  // Development-specific checks
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      warnings.push(
        'Consider setting NEXT_PUBLIC_SITE_URL for consistent OAuth redirects in development'
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get human-readable provider name
 */
export function getProviderDisplayName(provider: OAuthProvider): string {
  const config = getOAuthProviderConfig(provider);
  return config?.name || provider.charAt(0).toUpperCase() + provider.slice(1);
}

/**
 * Get provider-specific scopes
 */
export function getProviderScopes(provider: OAuthProvider): string | undefined {
  const config = getOAuthProviderConfig(provider);
  return config?.scopes;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  providers: oauthProviders,
  isEnabled: isOAuthProviderEnabled,
  getEnabled: getEnabledOAuthProviders,
  getConfig: getOAuthProviderConfig,
  getCallbackUrl: getOAuthCallbackUrl,
  generateRedirectUrl: generateOAuthRedirectUrl,
  validate: validateOAuthConfiguration,
  getDisplayName: getProviderDisplayName,
  getScopes: getProviderScopes,
};