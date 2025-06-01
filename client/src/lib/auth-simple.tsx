import React, { createContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  zip: string | null;
  about: string | null;
  authType: string;
  authId: string;
  createdAt: string;
}

interface EmailCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (provider: "google" | "facebook" | "email", credentials?: EmailCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    
    initAuth();
  }, []);

  const signIn = async (provider: "google" | "facebook" | "email", credentials?: EmailCredentials) => {
    if (provider === "email" && credentials) {
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            // Force immediate auth check to ensure session persistence
            setTimeout(refreshAuth, 100);
            return;
          }
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    } else {
      throw new Error(`${provider} authentication not implemented yet`);
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}