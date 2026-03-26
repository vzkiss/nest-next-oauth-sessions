'use client';

import Image from 'next/image';
import { config } from '../../lib/config';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';

export default function SignInPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${config.apiUrl}/auth/login/google`;
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Button
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 active:scale-[0.97]"
      >
        <Image
          width={20}
          height={20}
          className="h-5 w-5"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
        />
        <span>Sign in with Google</span>
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/"
          className="focus-visible:ring-ring cursor-pointer rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
