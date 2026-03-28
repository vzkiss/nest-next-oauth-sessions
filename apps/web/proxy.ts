import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routes } from '@/config/routes';
import { sessionCookieName } from '@/config/session';

// Browser `pathname` prefixes that require a session
const protectedPathPrefixes = [routes.profile] as const;

/**
 * Check if the pathname is protected
 * @param pathname - The pathname to check
 * @returns True if the pathname is protected, false otherwise
 */
function isProtectedPathname(pathname: string): boolean {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Proxy to redirect to signin if the user is not authenticated
 * and the route is protected.
 * @param req - The incoming request
 * @returns - The response
 */
export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtectedRoute = isProtectedPathname(pathname);

  const hasSession = req.cookies.has(sessionCookieName);

  if (isProtectedRoute && !hasSession) {
    const url = new URL(routes.signIn, req.url);
    url.searchParams.set('redirect', pathname + search);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// only run proxy on matched routes
// save edge runtime from running the proxy on every request
export const config = {
  matcher: ['/profile/:path*'],
};
