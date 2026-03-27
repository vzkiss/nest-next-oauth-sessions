'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { config } from '@/lib/config';

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
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const response = await fetch(`${config.apiUrl}/user/profile`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data: AuthUser = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${config.apiUrl}/auth/logout`, {
      credentials: 'include',
    });
    setUser(null);
  }, []);

  const clearSession = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, fetchUser, logout, clearSession }}>
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
