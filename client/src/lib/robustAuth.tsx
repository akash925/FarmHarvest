import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  name: string;
  email: string;
  zip?: string;
  image?: string;
  about?: string;
  productsGrown?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, zip?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshAuth: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function RobustAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Verify session immediately after login
        setTimeout(async () => {
          const verifiedUser = await checkAuthStatus();
          if (verifiedUser) {
            setUser(verifiedUser);
            // Invalidate all cached queries to refresh with user context
            queryClient.invalidateQueries();
          }
        }, 200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, zip?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, zip }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Verify session immediately after signup
        setTimeout(async () => {
          const verifiedUser = await checkAuthStatus();
          if (verifiedUser) {
            setUser(verifiedUser);
            queryClient.invalidateQueries();
          }
        }, 200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      queryClient.clear();
      // Force page refresh to clear any stale state
      window.location.href = '/';
    }
  };

  const refreshAuth = async () => {
    const user = await checkAuthStatus();
    return user;
  };

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Periodic session validation (every 2 minutes)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      const currentUser = await checkAuthStatus();
      if (!currentUser && user) {
        // Session expired, clear user state
        setUser(null);
        queryClient.clear();
      }
    }, 120000); // 2 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}