'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ProfileCard } from './ProfileCard';
import { FeedbackDialog } from './FeedbackDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await fetchUser();
      if (!result) {
        router.replace(routes.signin);
      }
    };

    load();
  }, [fetchUser, router]);

  const handleLogout = async () => {
    await logout();
    router.replace(routes.home);
  };

  return (
    <div className="text-foreground w-full grow space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <ProfileCard user={user} />

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
