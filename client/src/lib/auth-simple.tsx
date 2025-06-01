import React, { createContext, useContext, useEffect, useState } from "react";

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication on mount
    fetch("/api/auth/session", { credentials: "include" })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}