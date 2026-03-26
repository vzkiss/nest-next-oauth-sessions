'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const finalize = async () => {
      await fetchUser();
      router.replace('/profile');
    };

    finalize();
  }, [fetchUser, router]);

  return (
    <div className="w-full text-center">
      <div className="border-foreground mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
