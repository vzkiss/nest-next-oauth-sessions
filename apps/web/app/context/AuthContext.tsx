'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  fetchUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch('http://localhost:3000/user/profile', {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return null;
      }

      const data: AuthUser = await res.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('http://localhost:3000/auth/logout', {
      credentials: 'include',
    });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
