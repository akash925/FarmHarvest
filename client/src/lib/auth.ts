import React, { createContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (provider: "google" | "facebook") => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to check authentication:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (provider: "google" | "facebook") => {
    try {
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
      console.error(`Failed to sign in with ${provider}:`, error);
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
  
  const contextValue = {
    user,
    isInitializing,
    isAuthenticated: !!user,
    signIn,
    signOut
  };
  
  return (
    React.createElement(
      AuthContext.Provider,
      { value: contextValue },
      props.children
    )
  );
}
