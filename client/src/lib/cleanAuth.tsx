import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  zip?: string;
  image?: string;
  about?: string;
  productsGrown?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, zip?: string) => Promise<void>;
  logout: () => void;
  loginWithFacebook: () => void;
  loginWithInstagram: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values instead of throwing error
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {},
      signup: async () => {},
      logout: () => {},
      loginWithFacebook: () => {},
      loginWithInstagram: () => {},
    };
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      
      // Check localStorage backup first
      const storedUser = localStorage.getItem('farmUser');
      const timestamp = localStorage.getItem('farmUserTimestamp');
      
      if (storedUser && timestamp) {
        const userAge = Date.now() - parseInt(timestamp);
        if (userAge < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('Using stored user data');
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
          return;
        } else {
          // Clear expired data
          localStorage.removeItem('farmUser');
          localStorage.removeItem('farmUserTimestamp');
        }
      }
      
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      console.log('Auth response status:', response.status);
      console.log('Auth response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth success - user data:', data.user);
        setUser(data.user);
        // Update localStorage
        localStorage.setItem('farmUser', JSON.stringify(data.user));
        localStorage.setItem('farmUserTimestamp', Date.now().toString());
      } else {
        const errorData = await response.json();
        console.log('Auth failed - error:', errorData);
        setUser(null);
        // Clear localStorage on auth failure
        localStorage.removeItem('farmUser');
        localStorage.removeItem('farmUserTimestamp');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login...');
    
    // Force session creation first
    await fetch('/api/auth/session', { credentials: 'include' });
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Document cookies after login:', document.cookie);

    if (!response.ok) {
      const error = await response.json();
      console.log('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login success - user data:', data.user);
    
    // Store user data in localStorage as backup
    localStorage.setItem('farmUser', JSON.stringify(data.user));
    localStorage.setItem('farmUserTimestamp', Date.now().toString());
    
    setUser(data.user);
    
    // Force multiple re-checks to ensure session persists
    setTimeout(() => checkAuthStatus(), 50);
    setTimeout(() => checkAuthStatus(), 200);
    setTimeout(() => checkAuthStatus(), 500);
  };

  const signup = async (name: string, email: string, password: string, zip?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, zip }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear user state and localStorage
    setUser(null);
    localStorage.removeItem('farmUser');
    localStorage.removeItem('farmUserTimestamp');
    window.location.href = '/';
  };

  const loginWithFacebook = () => {
    window.location.href = '/api/auth/facebook';
  };

  const loginWithInstagram = () => {
    window.location.href = '/api/auth/instagram';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      loginWithFacebook,
      loginWithInstagram,
    }}>
      {children}
    </AuthContext.Provider>
  );
}