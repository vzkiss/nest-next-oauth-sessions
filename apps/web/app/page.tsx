'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push(routes.signIn);
  };

  const handleProfile = () => {
    router.push(routes.profile);
  };

  return (
    <div className="flex gap-2">
      <Button
        // variant="outline"
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
