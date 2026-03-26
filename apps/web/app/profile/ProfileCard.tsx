'use client';

import type { AuthUser } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileForm } from './ProfileForm';

const DEFAULT_AVATAR = '/avatar.png';

function ProfileCardSkeleton() {
  return (
    <Card className="rounded-3xl p-6 shadow-xs">
      <CardHeader>
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="mt-1 h-6 w-48" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="mt-1 h-8 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-1 h-8 w-full rounded-lg" />
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileCard({ user }: { user: AuthUser | null }) {
  if (!user) return <ProfileCardSkeleton />;

  const imageValue = user.image || DEFAULT_AVATAR;

  return (
    <Card className="rounded-3xl p-6 shadow-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <CardHeader>
        <img
          src={imageValue}
          alt={user.name}
          className="mx-auto h-20 w-20 rounded-full"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
      </CardHeader>
      <CardContent>
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  );
}

export { ProfileCard };
