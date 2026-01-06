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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
