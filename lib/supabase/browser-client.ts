// ============================================================================
// SUPABASE BROWSER CLIENT - CLIENT-SIDE ONLY
// ============================================================================
// Browser-specific Supabase client configuration for client-side operations
// This avoids server-side imports when used in React components
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ============================================================================
// CLIENT OPTIONS
// ============================================================================

const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'flip-platform/1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  cookieOptions: {
    name: 'flip-auth',
    domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : 'localhost',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  },
};

// ============================================================================
// BROWSER CLIENT CREATION
// ============================================================================

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!, clientOptions);
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('Browser client can only be used in the browser');
  }
  
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  
  return browserClient;
}

// Default export for convenience
export default getBrowserClient;