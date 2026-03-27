'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  apiRequest,
  apiFetch,
  configureApiSessionInvalidHandler,
  ApiUnauthorizedError,
} from '@/lib/api';
import { routes } from '@/lib/routes';

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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    configureApiSessionInvalidHandler(() => {
      setUser(null);
      router.replace(routes.signIn);
      toast.error('Session expired. Please sign in again.');
    });
    return () => configureApiSessionInvalidHandler(undefined);
  }, [router]);

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const response = await apiFetch('/user/profile');
      const data: AuthUser = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      if (error instanceof ApiUnauthorizedError) {
        return null;
      }
      console.error('Failed to fetch user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout');
    setUser(null);
  }, []);

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
