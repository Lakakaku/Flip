// ============================================================================
// AUTHENTICATION SERVICE - Supabase Integration  
// ============================================================================
// Production-ready authentication service for the Swedish marketplace platform
// Integrates with Supabase Auth and our user management system
// ============================================================================

import { getBrowserClient } from '../supabase/browser-client';
import type { User, SubscriptionTier } from '@/types/supabase';
import type { AuthResponse, Session, User as SupabaseUser, Provider } from '@supabase/supabase-js';
import { isOAuthProviderEnabled, getEnabledOAuthProviders, generateOAuthRedirectUrl } from './oauth-config';

// ============================================================================
// RESPONSE TYPE
// ============================================================================

export interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  locationCity?: string;
  locationRegion?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: Date;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  locationCity?: string;
  locationRegion?: string;
}

export type OAuthProvider = 'google' | 'facebook' | 'github' | 'apple';

export interface OAuthSignInOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: { [key: string]: string };
}

// ============================================================================
// MAIN AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<SupabaseResponse<AuthSession>> {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      if (!data.user || !data.session) {
        return {
          data: null,
          error: 'Authentication failed',
          success: false,
        };
      }

      // Get or create user profile
      const userProfile = await this.getOrCreateUserProfile(data.user);
      if (!userProfile) {
        return {
          data: null,
          error: 'Failed to retrieve user profile',
          success: false,
        };
      }

      const authSession: AuthSession = {
        user: this.convertToAuthUser(userProfile),
        accessToken: data.session.access_token,
        expiresAt: new Date(data.session.expires_at! * 1000),
      };

      return {
        data: authSession,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during sign in',
        success: false,
      };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(signUpData: SignUpData): Promise<SupabaseResponse<AuthUser>> {
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
          },
        },
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: 'User registration failed',
          success: false,
        };
      }

      // Create user profile in our database
      const { data: userProfile, error: dbError } = await supabase
        .from('users')
        .insert({
          auth_id: data.user.id,
          email: signUpData.email,
          subscription_tier: 'freemium',
          location_city: signUpData.locationCity,
          location_region: signUpData.locationRegion,
        })
        .select()
        .single();

      if (dbError || !userProfile) {
        return {
          data: null,
          error: 'Failed to create user profile',
          success: false,
        };
      }

      return {
        data: this.convertToAuthUser(userProfile),
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during registration',
        success: false,
      };
    }
  }

  /**
   * Sign in with OAuth provider (Google, Facebook, etc.)
   */
  async signInWithOAuth(
    provider: OAuthProvider, 
    options: OAuthSignInOptions = {}
  ): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      
      // Check if provider is enabled
      if (!this.isOAuthProviderEnabled(provider)) {
        return {
          data: null,
          error: `${provider} authentication is not currently available`,
          success: false,
        };
      }

      const redirectTo = options.redirectTo || generateOAuthRedirectUrl(provider, {
        next: '/dashboard',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo,
          scopes: options.scopes,
          queryParams: options.queryParams,
        },
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      // OAuth sign-in redirects to the provider, so if we get here without error, it's successful
      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during OAuth authentication',
        success: false,
      };
    }
  }

  /**
   * Get supported OAuth providers
   */
  getSupportedOAuthProviders(): OAuthProvider[] {
    return getEnabledOAuthProviders().map(config => config.provider);
  }

  /**
   * Check if OAuth provider is enabled
   */
  isOAuthProviderEnabled(provider: OAuthProvider): boolean {
    return isOAuthProviderEnabled(provider);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during sign out',
        success: false,
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = getBrowserClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const { data: userProfile, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (dbError || !userProfile) {
        return null;
      }

      return this.convertToAuthUser(userProfile);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const supabase = getBrowserClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during password reset',
        success: false,
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during password update',
        success: false,
      };
    }
  }

  /**
   * Check if user has required subscription tier
   */
  async hasRequiredTier(requiredTier: SubscriptionTier): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || !currentUser.isActive) {
      return false;
    }

    const tierHierarchy = { freemium: 1, silver: 2, gold: 3 };
    const userTierLevel = tierHierarchy[currentUser.subscriptionTier];
    const requiredTierLevel = tierHierarchy[requiredTier];

    return userTierLevel >= requiredTierLevel;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    locationCity?: string;
    locationRegion?: string;
  }): Promise<SupabaseResponse<AuthUser>> {
    try {
      const supabase = getBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false,
        };
      }

      const { data: updatedProfile, error: dbError } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          location_city: updates.locationCity,
          location_region: updates.locationRegion,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user.id)
        .select()
        .single();

      if (dbError || !updatedProfile) {
        return {
          data: null,
          error: dbError?.message || 'Failed to update profile',
          success: false,
        };
      }

      return {
        data: this.convertToAuthUser(updatedProfile),
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during profile update',
        success: false,
      };
    }
  }

  /**
   * Change password with current password verification
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      
      // First verify the current password by attempting to sign in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.email) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false,
        };
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        return {
          data: null,
          error: 'Current password is incorrect',
          success: false,
        };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return {
          data: null,
          error: updateError.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during password change',
        success: false,
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(currentPassword: string): Promise<SupabaseResponse<void>> {
    try {
      const supabase = getBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user?.email) {
        return {
          data: null,
          error: 'User not authenticated',
          success: false,
        };
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        return {
          data: null,
          error: 'Password is incorrect',
          success: false,
        };
      }

      // First, soft delete user profile (mark as inactive)
      const { error: deactivateError } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user.id);

      if (deactivateError) {
        return {
          data: null,
          error: 'Failed to deactivate account',
          success: false,
        };
      }

      // Then sign out the user
      await supabase.auth.signOut();

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        data: null,
        error: 'An unexpected error occurred during account deletion',
        success: false,
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getOrCreateUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
    const supabase = getBrowserClient();
    
    // First try to get existing profile
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', supabaseUser.id)
      .single();
    
    if (existingProfile) {
      return existingProfile;
    }
    
    // If not found, create one
    const { data: newProfile, error } = await supabase
      .from('users')
      .insert({
        auth_id: supabaseUser.id,
        email: supabaseUser.email!,
        subscription_tier: 'freemium',
      })
      .select()
      .single();

    if (error || !newProfile) {
      return null;
    }

    return newProfile;
  }

  private convertToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      isActive: user.is_active,
      firstName: user.first_name || undefined,
      lastName: user.last_name || undefined,
      avatarUrl: user.avatar_url || undefined,
      locationCity: user.location_city || undefined,
      locationRegion: user.location_region || undefined,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const authService = new AuthService();

// ============================================================================
// AUTH STATE MANAGEMENT
// ============================================================================

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

// Auth event types for React hooks
export type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';