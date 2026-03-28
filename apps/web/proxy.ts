import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// sandbox defaults
const protectedRoutes = ['/profile'];

const defaultRedirectTo = '/signin';

/**
 * Proxy to redirect to signin if the user is not authenticated
 * and the route is protected.
 * @param req - The incoming request
 * @returns - The response
 */
export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // check 'connect-pg-simple' default session cookie
  const hasSession = req.cookies.has('connect.sid');

  if (isProtectedRoute && !hasSession) {
    const url = new URL(defaultRedirectTo, req.url);
    url.searchParams.set('redirect', pathname + search);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// only run proxy on matched routes
export const config = {
  matcher: ['/profile', '/profile/:path*'],
};
