'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={handleSignIn}
        className="w-40"
      >
        Sign in
      </Button>
      <Button size="lg" onClick={handleProfile} className="w-40">
        Profile
      </Button>
    </div>
  );
}
