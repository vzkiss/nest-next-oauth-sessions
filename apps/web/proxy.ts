import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Path prefixes for routes that require a session cookie on the Next request. */
const protectedRoutes = ['/profile'];

const redirectTo = '/signin';

// `matcher` uses path patterns (e.g. `/profile/:path*`); `pathname` at runtime is
// `/profile` or `/profile/...` — use `startsWith`, never `includes('/profile/:path*')`.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const hasSession = req.cookies.has('connect.sid');

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
