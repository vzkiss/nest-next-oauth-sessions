'use client';

import Image from 'next/image';

export default function SignInPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/login/google';
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 py-3 px-6 bg-black hover:bg-black/80 text-white rounded-full cursor-pointer"
      >
        <Image
          width={20}
          height={20}
          className="w-5 h-5"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          loading="lazy"
          alt="google logo"
        />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}
