// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================
// Production-ready Supabase client setup for the Swedish marketplace platform
// Implements proper error handling, retry logic, and type safety as required
// by CLAUDE.md specifications
// ============================================================================

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ============================================================================
// CLIENT CONFIGURATIONS
// ============================================================================

// Standard client options for consistent behavior
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
  // Connection pooling for better performance
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// ============================================================================
// BROWSER CLIENT (Client-side operations)
// ============================================================================

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    ...clientOptions,
    cookieOptions: {
      name: 'flip-auth',
      domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : 'localhost',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Browser client needs access
    },
  });
}

// ============================================================================  
// SERVER CLIENT (Server-side operations with cookies)
// ============================================================================

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    ...clientOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : 'localhost',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          });
        } catch (error) {
          // This can be ignored if you have middleware refreshing user sessions
          console.warn('Failed to set cookies:', error);
        }
      },
    },
  });
}

// ============================================================================
// SERVICE ROLE CLIENT (Admin operations)
// ============================================================================

export function createServiceSupabaseClient() {
  if (!supabaseServiceKey) {
    throw new Error('Service role key is required for admin operations');
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceKey, {
    ...clientOptions,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'flip-platform-service/1.0.0',
      },
    },
  });
}

// ============================================================================
// ERROR HANDLING WRAPPER
// ============================================================================

export interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export async function executeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<SupabaseResponse<T>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Supabase query error:', error);
      return {
        data: null,
        error: error.message || 'An unknown database error occurred',
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in Supabase query:', error);
    return {
      data: null,
      error: 'A network or connection error occurred',
      success: false,
    };
  }
}

// ============================================================================
// RETRY MECHANISM
// ============================================================================

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry authentication errors or client errors (4xx)
      if (
        lastError.message.includes('auth') ||
        lastError.message.includes('unauthorized') ||
        lastError.message.includes('forbidden')
      ) {
        throw lastError;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Retrying operation (attempt ${attempt}/${maxRetries})...`);
    }
  }
  
  throw lastError!;
}

// ============================================================================
// CONNECTION HEALTH CHECK
// ============================================================================

export async function checkSupabaseConnection(client: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await client.from('system_settings').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// REALTIME HELPERS
// ============================================================================

export interface RealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

export function subscribeToTable(
  client: SupabaseClient,
  options: RealtimeSubscriptionOptions,
  callback: (payload: any) => void
) {
  const channel = client
    .channel(`${options.table}-changes`)
    .on(
      'postgres_changes',
      {
        event: options.event || '*',
        schema: options.schema || 'public',
        table: options.table,
        filter: options.filter,
      },
      callback
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

// ============================================================================
// TYPE-SAFE DATABASE OPERATIONS
// ============================================================================

export class SupabaseService {
  constructor(private client: SupabaseClient<Database>) {}

  // Authentication helpers
  async getCurrentUser(): Promise<SupabaseResponse<User>> {
    return executeSupabaseQuery(async () => {
      const { data: { user }, error } = await this.client.auth.getUser();
      return { data: user, error };
    });
  }

  async getCurrentSession(): Promise<SupabaseResponse<Session>> {
    return executeSupabaseQuery(async () => {
      const { data: { session }, error } = await this.client.auth.getSession();
      return { data: session, error };
    });
  }

  // Database helpers with retry logic
  async select<T>(
    table: keyof Database['public']['Tables'],
    query?: any
  ): Promise<SupabaseResponse<T[]>> {
    return executeWithRetry(async () => {
      return executeSupabaseQuery(async () => {
        const { data, error } = await this.client
          .from(table)
          .select(query || '*');
        return { data, error };
      });
    });
  }

  async insert<T>(
    table: keyof Database['public']['Tables'],
    values: any
  ): Promise<SupabaseResponse<T[]>> {
    return executeWithRetry(async () => {
      return executeSupabaseQuery(async () => {
        const { data, error } = await this.client
          .from(table)
          .insert(values)
          .select();
        return { data, error };
      });
    });
  }

  async update<T>(
    table: keyof Database['public']['Tables'],
    values: any,
    match: any
  ): Promise<SupabaseResponse<T[]>> {
    return executeWithRetry(async () => {
      return executeSupabaseQuery(async () => {
        const { data, error } = await this.client
          .from(table)
          .update(values)
          .match(match)
          .select();
        return { data, error };
      });
    });
  }

  async delete<T>(
    table: keyof Database['public']['Tables'],
    match: any
  ): Promise<SupabaseResponse<T[]>> {
    return executeWithRetry(async () => {
      return executeSupabaseQuery(async () => {
        const { data, error } = await this.client
          .from(table)
          .delete()
          .match(match)
          .select();
        return { data, error };
      });
    });
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    return checkSupabaseConnection(this.client);
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

// These will be created on-demand to avoid SSR issues
let browserClient: SupabaseClient<Database> | null = null;
let serviceClient: SupabaseClient<Database> | null = null;

export function getBrowserClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('Browser client can only be used in the browser');
  }
  
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  
  return browserClient;
}

export function getServiceClient(): SupabaseClient<Database> {
  if (!serviceClient) {
    serviceClient = createServiceSupabaseClient();
  }
  
  return serviceClient;
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const supabase = {
  // Client creation functions
  browser: createBrowserSupabaseClient,
  server: createServerSupabaseClient,
  service: createServiceSupabaseClient,
  
  // Singleton getters
  getBrowser: getBrowserClient,
  getService: getServiceClient,
  
  // Utilities
  executeQuery: executeSupabaseQuery,
  executeWithRetry,
  checkConnection: checkSupabaseConnection,
  subscribeToTable,
};

export default supabase;