import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  zip?: string;
  about?: string;
  productsGrown?: string;
  authType: string;
}

export interface SellerProfile {
  id: number;
  userId: number;
  businessName: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  operatingHours?: string;
  certifications?: string;
  productsGrown?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  zip: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  sellerProfile?: SellerProfile | null;
}

// API functions
const authAPI = {
  async getSession(): Promise<AuthResponse | null> {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to get session');
    }
    
    return response.json();
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }

    return response.json();
  },

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    return response.json();
  },

  async signOut(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Sign out failed');
    }
  },
};

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current session
  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      console.log('Fetching session...');
      const result = await authAPI.getSession();
      console.log('Session fetch result:', result);
      return result;
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (not authenticated)
      if (error && (error as any).message?.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (reduced from 5 minutes for better debugging)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: authAPI.signIn,
    onSuccess: async (data) => {
      console.log('Sign in successful, updating session cache:', data);
      // Update the session cache immediately
      queryClient.setQueryData(['session'], data);
      // Also invalidate to trigger a fresh fetch
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: authAPI.signUp,
    onSuccess: async (data) => {
      console.log('Sign up successful, updating session cache:', data);
      // Update the session cache immediately
      queryClient.setQueryData(['session'], data);
      // Also invalidate to trigger a fresh fetch
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: authAPI.signOut,
    onSuccess: async () => {
      console.log('Sign out successful, clearing session');
      // Clear the session cache
      queryClient.setQueryData(['session'], null);
      // Invalidate to ensure clean state
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });

  const user = session?.user || null;
  const sellerProfile = session?.sellerProfile || null;
  const isAuthenticated = !!user;
  const isLoading = isSessionLoading || signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending;

  return {
    // User state
    user,
    sellerProfile,
    isAuthenticated,
    isLoading,
    sessionError,

    // Actions
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,

    // Mutation states
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}

// Hook for pages that require authentication
export function useRequireAuth() {
  const auth = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return {
    ...auth,
    shouldRedirect,
  };
} 