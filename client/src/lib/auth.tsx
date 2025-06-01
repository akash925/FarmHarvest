// client/src/lib/auth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiRequest } from "./queryClient";

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
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
    const savedToken = localStorage.getItem("fh_token");
    if (savedToken) {
      setToken(savedToken);
      (async () => {
        try {
          const res = await apiRequest(
            "GET",
            "/api/auth/session",
            undefined,
            savedToken
          );
          if (res.ok) {
            const { user: existingUser } = await res.json();
            if (existingUser) setUser(existingUser);
            else {
              localStorage.removeItem("fh_token");
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem("fh_token");
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem("fh_token");
          setToken(null);
          setUser(null);
        } finally {
          setIsInitializing(false);
        }
      })();
    } else {
      setIsInitializing(false);
    }
  }, []);

  async function signIn(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`Login failed: ${text}`);
    }
    const { token: newToken, user: loggedInUser } = await res.json();
    localStorage.setItem("fh_token", newToken);
    setToken(newToken);
    setUser(loggedInUser);
  }

  function signOut() {
    localStorage.removeItem("fh_token");
    setToken(null);
    setUser(null);
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