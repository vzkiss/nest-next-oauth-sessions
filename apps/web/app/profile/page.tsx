'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ProfileForm } from './ProfileForm';

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuth();

  useEffect(() => {
    const load = async () => {
      const result = await fetchUser();
      if (!result) {
        router.replace('/signin');
      }
    };

    load();
  }, [fetchUser, router]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div className="w-full grow space-y-6 text-gray-900 hover:underline">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button
          onClick={handleLogout}
          className="flex cursor-pointer text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          Logout
        </button>
      </div>

      <ProfileForm user={user} />

      <div className="text-center text-sm">
        <a href="/" className="cursor-pointer hover:underline">
          Home
        </a>
      </div>
    </div>
  );
}
