'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ProfileForm } from './ProfileForm';
import { FeedbackDialog } from './FeedbackDialog';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
    <div className="text-foreground w-full grow space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <ProfileForm user={user} />

      <div className="flex justify-between text-center text-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="cursor-pointer hover:underline">
            Home
          </Link>
          |
          <Button variant="ghost" className="p-0" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <Button size="sm" onClick={() => setFeedbackOpen(true)}>
          Feedback
        </Button>
      </div>

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
