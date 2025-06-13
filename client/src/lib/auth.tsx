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
    console.log("Default signIn called - provider may not be ready");
  },
  signOut: () => {
    console.log("Default signOut called - provider may not be ready");
  }
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export { AuthContext };

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx;
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

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkAuth, 100);
    
    return () => {
      clearTimeout(timer);
      mounted = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    try {
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
          setIsInitializing(false);
          return;
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    } catch (error) {
      console.error("SignIn error:", error);
      throw error;
    }
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

  console.log("AuthProvider rendering with:", { user: !!user, isInitializing, isAuthenticated: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}