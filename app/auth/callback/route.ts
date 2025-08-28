// ============================================================================
// AUTH CALLBACK ROUTE - Handle OAuth and Email Confirmations
// ============================================================================
// Handles OAuth provider callbacks and email confirmation tokens
// Redirects to dashboard on success, shows error page on failure
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CallbackResponse {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// GET HANDLER - OAuth Callbacks and Email Confirmations
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const type = requestUrl.searchParams.get('type');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    // Handle OAuth errors (user cancelled, provider issues, etc.)
    if (error) {
      console.error('OAuth callback error:', { error, errorDescription });
      return redirectToError(requestUrl.origin, `Authentication failed: ${errorDescription || error}`);
    }

    // Handle missing code parameter
    if (!code) {
      console.error('Missing authorization code in callback');
      return redirectToError(requestUrl.origin, 'Missing authorization code');
    }

    const supabase = createServerSupabaseClient();

    // Exchange code for session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Failed to exchange code for session:', sessionError);
      return redirectToError(requestUrl.origin, 'Authentication failed. Please try again.');
    }

    if (!sessionData?.user) {
      console.error('No user data received from session exchange');
      return redirectToError(requestUrl.origin, 'Authentication failed. No user data received.');
    }

    // Handle different callback types
    let redirectUrl = `${requestUrl.origin}${next}`;

    switch (type) {
      case 'signup':
        // For email signups, we might want to show a welcome message
        redirectUrl = `${requestUrl.origin}/dashboard?welcome=true`;
        break;
      
      case 'recovery':
        // For password recovery, redirect to reset password page
        redirectUrl = `${requestUrl.origin}/auth/reset-password`;
        break;
      
      case 'invite':
        // For team invites, handle special logic
        redirectUrl = `${requestUrl.origin}/dashboard?invited=true`;
        break;
      
      default:
        // Default OAuth login or email confirmation
        redirectUrl = `${requestUrl.origin}${next}`;
    }

    // Ensure user profile exists in our database
    await ensureUserProfile(supabase, sessionData.user);

    // Log successful authentication
    console.log('Successful authentication callback:', {
      userId: sessionData.user.id,
      email: sessionData.user.email,
      provider: sessionData.user.app_metadata.provider || 'email',
      type: type || 'login',
    });

    // Redirect to the appropriate page
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    const requestUrl = new URL(request.url);
    return redirectToError(requestUrl.origin, 'An unexpected error occurred during authentication');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Redirect to error page with error message
 */
function redirectToError(origin: string, errorMessage: string): NextResponse {
  const errorUrl = new URL('/auth/error', origin);
  errorUrl.searchParams.set('message', errorMessage);
  return NextResponse.redirect(errorUrl.toString());
}

/**
 * Ensure user profile exists in our database
 * This is critical for OAuth users who might not have a profile yet
 */
async function ensureUserProfile(supabase: any, user: any): Promise<void> {
  try {
    // Check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    // If profile exists, we're done
    if (existingProfile && !fetchError) {
      return;
    }

    // Create new user profile
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        auth_id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || null,
        last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        subscription_tier: 'freemium',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      // Log error but don't fail the authentication
      console.error('Failed to create user profile:', insertError);
    } else {
      console.log('Created new user profile for:', user.email);
    }
  } catch (error) {
    // Log error but don't fail the authentication
    console.error('Error ensuring user profile:', error);
  }
}

// ============================================================================
// POST HANDLER - For any additional callback handling
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Handle any POST callbacks if needed in the future
    // For now, return method not allowed
    return NextResponse.json(
      { 
        success: false, 
        error: 'POST method not supported for auth callbacks' 
      },
      { status: 405 }
    );
  } catch (error) {
    console.error('Error in auth callback POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process callback' 
      },
      { status: 500 }
    );
  }
}