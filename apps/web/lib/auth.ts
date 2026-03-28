import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@repo/api/user/entities/user.entity';
import { apiUrl } from '@/lib/api';
import { apiPaths } from '@/config/api-paths';
import { routes } from '@/config/routes';

export type ValidateSessionResult =
  | { ok: true; user: User }
  | { ok: false; error?: string };

/**
 * Server-only: forwards request cookies to the API and loads the current user.
 * Use from RSC pages, route handlers, or server actions — not from client components.
 */
async function authUncached(): Promise<ValidateSessionResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  const response = await fetch(apiUrl(apiPaths.userProfile), {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false };
  }

  const user = (await response.json()) as User;
  return { ok: true, user };
}

/**
 * Wrapped in React `cache()` so multiple calls in the same RSC request (e.g. protected
 * layout + page) dedupe to a single `fetch` — standard pattern for Next.js App Router.
 */

const auth = cache(async (): Promise<User | null> => {
  const result = await authUncached();
  return result.ok ? result.user : null;
});

/**
 * Server-only: use in protected layouts and pages. Redirects to `/signin` if there is
 * no valid session; otherwise returns the current user. Internally uses cached
 * {@link auth}, so layout + page in one request still mean a single API call.
 */
export async function requireAuth(): Promise<User> {
  const user = await auth();

  if (!user) {
    redirect(`${routes.signIn}?redirect=${encodeURIComponent(routes.profile)}`);
  }

  return user;
}
