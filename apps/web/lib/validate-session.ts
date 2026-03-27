import { cookies } from 'next/headers';
import type { UserDto } from '@repo/dto';
import { apiUrl } from '@/lib/api';

export type ValidateSessionResult =
  | { ok: true; user: UserDto }
  | { ok: false; error?: string };

/**
 * Server-only: forwards request cookies to the API and loads the current user.
 * Use from RSC pages, route handlers, or server actions — not from client components.
 */
export async function validateSession(): Promise<ValidateSessionResult> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  const response = await fetch(apiUrl('/user/profile'), {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false };
  }

  const user = (await response.json()) as UserDto;
  return { ok: true, user };
}
