// client/src/lib/auth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface User {
  id: number;
  name: string | null;
  email: string;
  image?: string | null;
  zip?: string | null;
  about?: string | null;
  authType: string;
  authId: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const defaultAuthContext: AuthContextValue = {
  user: null,
  token: null,
  isInitializing: true,
  isAuthenticated: false,
  signIn: async () => {
    throw new Error("Auth not initialized");
  },
  signOut: () => {
    console.warn("Auth not initialized");
  }
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export { AuthContext };

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx || defaultAuthContext;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!mounted) return;
        
        if (response.ok) {
          const data = await response.json();
          if (data.user && mounted) {
            setUser(data.user);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        return;
      }
    }
    
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  async function signOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }

  const value: AuthContextValue = {
    user,
    token,
    isInitializing,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}