import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile'];

const redirectTo = '/signin';

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // const isProtectedRoute = protectedRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const hasSession = req.cookies.has('connect.sid');

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
