import React, { createContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "./queryClient";

// Define User type directly to avoid import issues
interface User {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  zip: string | null;
  about: string | null;
  authType: string;
  authId: string;
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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  signIn: async (_provider, _credentials?) => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [, forceUpdate] = useState({});
  
  console.log("AuthProvider render - user exists:", !!user, "isInitializing:", isInitializing);

  // Simplified auth check that always completes initialization
  const checkAuth = async () => {
    setIsInitializing(true);
    try {
      console.log("Checking authentication session...");
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Session check received user:", data.user);
        // Force a complete re-render by creating a new object reference
        if (data.user) {
          setUser({ ...data.user });
        } else {
          setUser(null);
        }
        console.log("Auth state updated, user set:", !!data.user);
      } else {
        console.log("Session check failed:", res.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check authentication:", error);
      setUser(null);
    }
    
    // Always complete initialization
    console.log("Setting isInitializing to false");
    setIsInitializing(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signIn = async (provider: "google" | "facebook" | "email", credentials?: EmailCredentials) => {
    try {
      // Handle email/password authentication
      if (provider === "email" && credentials) {
        console.log("Attempting login with:", credentials.email);
        
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Invalid email or password");
        }
        
        const data = await res.json();
        console.log("Login successful:", data.user);
        setUser(data.user);
        
        // Force a page reload to ensure all components recognize the new auth state
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }

      // In a real implementation, we would use the proper OAuth flow
      if (provider === "google") {
        const mockGoogleData = {
          token: "mock_token",
          userData: {
            id: "123456789",
            name: "John Doe",
            email: "john.doe@example.com",
            picture: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
          },
        };

        const res = await apiRequest("POST", "/api/auth/google", mockGoogleData);
        const data = await res.json();
        setUser(data.user);
      } else if (provider === "facebook") {
        const mockFacebookData = {
          token: "mock_token",
          userData: {
            id: "987654321",
            name: "Jane Doe",
            email: "jane.doe@example.com",
            picture: {
              data: {
                url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80",
              },
            },
          },
        };

        const res = await apiRequest("POST", "/api/auth/facebook", mockFacebookData);
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error(`Failed to sign in:`, error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  };
  
  const contextValue = React.useMemo(() => ({
    user,
    isInitializing,
    isAuthenticated: !!user,
    signIn,
    signOut
  }), [user, isInitializing]);
  
  // Force re-render when user state changes
  console.log("AuthProvider render - user exists:", !!user, "isInitializing:", isInitializing);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}