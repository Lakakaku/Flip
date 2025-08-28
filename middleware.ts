// ============================================================================
// AUTHENTICATION MIDDLEWARE - Next.js 14/15 App Router
// ============================================================================
// Protects dashboard routes by checking Supabase authentication status
// Redirects unauthenticated users to login with preserved destination
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Protected route patterns (used in isProtectedRoute function logic)
// const PROTECTED_ROUTES = ['/dashboard', '/(dashboard)'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
];

// Auth-specific routes
const AUTH_CALLBACK_ROUTE = '/auth/callback';
const LOGIN_ROUTE = '/login';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if the current path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  // Check for direct dashboard access
  if (pathname.startsWith('/dashboard')) {
    return true;
  }

  // Check for route group pattern (dashboard routes)
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && segments[0] === 'dashboard';
}

/**
 * Check if the current path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Create redirect URL with preserved destination
 */
function createRedirectUrl(request: NextRequest, loginPath: string = LOGIN_ROUTE): URL {
  const redirectUrl = new URL(loginPath, request.url);
  
  // Preserve the intended destination for post-login redirect
  const intendedPath = request.nextUrl.pathname + request.nextUrl.search;
  if (intendedPath && intendedPath !== '/' && intendedPath !== loginPath) {
    redirectUrl.searchParams.set('redirectTo', intendedPath);
  }
  
  return redirectUrl;
}

// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Skip middleware for auth callback (handled separately)
    if (pathname.startsWith(AUTH_CALLBACK_ROUTE)) {
      return NextResponse.next();
    }

    // Only apply auth middleware to protected routes
    if (!isProtectedRoute(pathname)) {
      return NextResponse.next();
    }

    // ========================================================================
    // SUPABASE AUTHENTICATION CHECK
    // ========================================================================

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables in middleware');
      return NextResponse.redirect(createRedirectUrl(request));
    }

    // Create response to manage cookies
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Create Supabase client with cookie management
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : undefined,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          });
        },
      },
    });

    // Check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session retrieval errors
    if (sessionError) {
      console.error('Middleware session error:', sessionError);
      return NextResponse.redirect(createRedirectUrl(request));
    }

    // If no session, redirect to login
    if (!session?.user) {
      console.log('No session found, redirecting to login:', pathname);
      return NextResponse.redirect(createRedirectUrl(request));
    }

    // Verify user profile exists in database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, is_active')
      .eq('auth_id', session.user.id)
      .single();

    // If no profile or profile error, redirect to login
    if (profileError || !userProfile) {
      console.error('User profile not found or error:', profileError);
      return NextResponse.redirect(createRedirectUrl(request));
    }

    // If user account is inactive, redirect to login
    if (!userProfile.is_active) {
      console.log('User account is inactive, redirecting to login');
      return NextResponse.redirect(createRedirectUrl(request));
    }

    // ========================================================================
    // SESSION REFRESH HANDLING
    // ========================================================================

    // Check if session needs refresh (expires within 1 hour)
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      if (expiresAt.getTime() - now.getTime() < oneHour) {
        console.log('Session expires soon, refreshing...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh session:', refreshError);
          return NextResponse.redirect(createRedirectUrl(request));
        }
      }
    }

    // ========================================================================
    // SUCCESS - ALLOW ACCESS
    // ========================================================================

    // Log successful authentication for monitoring
    console.log('Middleware auth success:', {
      userId: session.user.id,
      path: pathname,
      userAgent: request.headers.get('user-agent')?.slice(0, 50),
    });

    // User is authenticated and active, allow access
    return response;

  } catch (error) {
    // Handle unexpected errors gracefully
    console.error('Middleware error:', error);
    
    // In case of any error, redirect to login to be safe
    return NextResponse.redirect(createRedirectUrl(request));
  }
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.).*)',
  ],
};