'use client';

import Image from 'next/image';

export default function SignInPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/login/google';
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        onClick={handleGoogleLogin}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-6 py-3 text-white hover:bg-black/80"
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
      </button>

      <div className="text-center text-sm">
        <a href="/" className="cursor-pointer hover:underline">
          Home
        </a>
      </div>
    </div>
  );
}
