'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ProfileForm } from './ProfileForm';
import { config } from '../../lib/config';
import Link from 'next/link';

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

  /**
   * A simple feedback endpoint demonstrates where async message queues would be used:
   *  **In production:** This would publish to a RabbitMQ queue for async processing by a worker service.
   *  **Current implementation:** Logs feedback synchronously for demonstration purposes.
   */
  const handleFeedback = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'User feedback!',
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      alert('Thanks for the feedback!');
    } catch (error) {
      alert(`Feedback submission error: ${error}`);
    }
  };

  return (
    <div className="w-full grow space-y-6 text-gray-900">
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

      <div className="flex justify-between text-center text-sm">
        <Link href="/" className="cursor-pointer hover:underline">
          Home
        </Link>
        <button
          onClick={handleFeedback}
          className="cursor-pointer hover:underline"
        >
          Feedback
        </button>
      </div>
    </div>
  );
}
