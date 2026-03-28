'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push(routes.signIn);
  };

  const handleProfile = () => {
    // Full navigation so proxy runs on a document request. `router.push` can
    // paint the static /profile shell before RSC applies the redirect.
    // window.location.assign(routes.profile);
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
