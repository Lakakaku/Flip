'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService, type AuthUser } from '@/lib/auth';
import { getBrowserClient } from '@/lib/supabase/browser-client';
import type { Session } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: { firstName?: string; lastName?: string; locationCity?: string; locationRegion?: string; }) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT  
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ============================================================================
  // SUPABASE AUTH LISTENER
  // ============================================================================

  useEffect(() => {
    const supabase = getBrowserClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            session,
            isLoading: false,
            isAuthenticated: !!user,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          // User signed in or token refreshed
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            session,
            isLoading: false,
            isAuthenticated: !!user,
          });
        } else {
          // User signed out or session expired
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await authService.signIn(email, password);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login failed');
      }

      // State will be updated by the auth listener
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await authService.signOut();
      
      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }

      // State will be updated by the auth listener
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const signUpData = { 
        email, 
        password,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      };
      
      const result = await authService.signUp(signUpData);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Registration failed');
      }

      // State will be updated by the auth listener
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const result = await authService.resetPassword(email);
      
      if (!result.success) {
        throw new Error(result.error || 'Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      const result = await authService.updatePassword(newPassword);
      
      if (!result.success) {
        throw new Error(result.error || 'Password update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (!result.success) {
        throw new Error(result.error || 'Password change failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: { 
    firstName?: string; 
    lastName?: string; 
    locationCity?: string; 
    locationRegion?: string; 
  }): Promise<void> => {
    try {
      const result = await authService.updateProfile(updates);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Profile update failed');
      }

      // Refresh the user state with updated data
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (currentPassword: string): Promise<void> => {
    try {
      const result = await authService.deleteAccount(currentPassword);
      
      if (!result.success) {
        throw new Error(result.error || 'Account deletion failed');
      }
      
      // Auth state will be updated by the auth listener when user is signed out
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser();
      const session = await authService.getCurrentSession();
      
      setAuthState(prev => ({
        ...prev,
        user,
        session,
        isAuthenticated: !!user,
      }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextValue = {
    ...authState,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    changePassword,
    updateProfile,
    deleteAccount,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export default function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}