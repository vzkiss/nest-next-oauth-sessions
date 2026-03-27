'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { UserDto } from '@repo/dto';
import { apiRequest, configureApiSessionInvalidHandler } from '@/lib/api';
import { routes } from '@/lib/routes';

interface AuthContextType {
  user: UserDto | null;
  updateUser: (user: UserDto | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 * - handles the session invalidation and redirects to the sign-in page
 * - shows a toast message if the user was authenticated when the session expired
 * - updates the user state
 * - logs out the user
 *
 * @param children - The children components.
 * @returns The AuthProvider component.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<UserDto | null>(null);
  const userRef = useRef<UserDto | null>(null);
  userRef.current = user;

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout');
    setUser(null);
  }, []);

  useEffect(() => {
    configureApiSessionInvalidHandler(() => {
      const hadAuthenticatedUser = userRef.current != null;
      setUser(null);

      router.replace(routes.signIn);
      if (hadAuthenticatedUser) {
        toast.error('Session expired. Please sign in again.');
      }
    });
    return () => configureApiSessionInvalidHandler(undefined);
  }, [router]);

  const updateUser = useCallback((user: UserDto | null) => {
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, updateUser, logout }}>
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
