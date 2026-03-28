'use client';

import Image from 'next/image';
import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiUrl } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { toast } from 'sonner';

/**
 * Handles the oauth cancelled message
 * if the user cancels the oauth flow, or error: access_denied
 */
function useOauthCancelled() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('oauth') !== 'cancelled') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete('oauth');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);

    toast.error('Sign-in was cancelled.', {
      id: 'signin-oauth-cancelled',
      duration: Infinity,
      cancel: {
        label: 'Close',
        onClick: () => {},
      },
    });
  }, [router, pathname, searchParams]);
}

/**
 * SignInForm component
 * - renders the sign in form
 * - handles the google login
 * - renders the home link
 * @returns The SignInForm component.
 */
function SignInForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';

  // run custom hook
  useOauthCancelled();

  const handleGoogleLogin = () => {
    const url = new URL(apiUrl('/auth/login/google'));

    if (redirect) {
      url.searchParams.set('redirect', encodeURIComponent(redirect));
    }

    window.location.href = url.toString();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Button
        size="lg"
        onClick={handleGoogleLogin}
        className="flex items-center gap-2"
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
          href={routes.home}
          className="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

/**
 * SignInPage component, wraps the SignInForm component in a suspense fallback
 * to prevent the page from flashing while the oauth flow is in progress
 * due to use of useSearchParams hook.
 * @returns The SignInPage component.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
