'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ProfileForm } from './ProfileForm';
import { FeedbackDialog } from './FeedbackDialog';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import Link from 'next/link';

function ProfileCardSkeleton() {
  return (
    <div className="bg-surface space-y-4 rounded-3xl p-6 shadow-xs">
      <Skeleton className="mx-auto h-20 w-20 rounded-full" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-10" />
          <Skeleton className="mt-1 h-6 w-48" />
        </div>
        <div>
          <Skeleton className="h-5 w-10" />
          <Skeleton className="mt-1 h-[42px] w-full rounded-md" />
          <div className="mt-1 h-5" />
        </div>
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-1 h-[42px] w-full rounded-md" />
          <div className="mt-1 h-5" />
        </div>
        <Skeleton className="h-[44px] w-full rounded-full" />
      </div>
    </div>
  );
}

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

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div className="text-foreground w-full grow space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      {user ? <ProfileForm user={user} /> : <ProfileCardSkeleton />}

      <div className="flex justify-between text-center text-sm">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="focus-visible:ring-ring cursor-pointer rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
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
