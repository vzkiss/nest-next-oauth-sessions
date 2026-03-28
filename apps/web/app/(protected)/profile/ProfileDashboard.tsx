'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from './ProfileForm';
import { FeedbackDialog } from './FeedbackDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import type { User } from '@repo/api/user/entities/user.entity';
import { useAuth } from '@/app/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileCardSkeleton() {
  return (
    <Skeleton
      className="h-[366px] rounded-3xl bg-white p-6 shadow-xs"
      aria-label="Loading profile"
    >
      <Skeleton className="bg-muted mx-auto h-20 w-20 animate-pulse rounded-full" />
      <Skeleton className="bg-muted h-4 w-24 animate-pulse rounded-md" />
      <Skeleton className="bg-muted mt-4 h-4 w-48 animate-pulse rounded-md" />
    </Skeleton>
  );
}

export default function ProfileDashboard({ user }: { user: User }) {
  const router = useRouter();
  const { logout, updateUser } = useAuth();
  const [synced, setSynced] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useLayoutEffect(() => {
    updateUser(user);
    setSynced(true);
  }, [user, updateUser]);

  const handleLogout = async () => {
    await logout();
    router.replace(routes.home);
  };

  if (!synced) {
    return (
      <div className="text-foreground w-full grow space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <ProfileCardSkeleton />
      </div>
    );
  }

  return (
    <div className="text-foreground w-full grow space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <ProfileForm />

      <div className="flex justify-between text-center text-sm">
        <div className="flex items-center gap-2">
          <Link
            href={routes.home}
            className="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Home
          </Link>
          |
          <Button variant="ghost" onClick={handleLogout}>
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
