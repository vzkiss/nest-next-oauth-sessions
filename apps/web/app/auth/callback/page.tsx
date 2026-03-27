import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/validate-session';
import { routes } from '@/lib/routes';

export const dynamic = 'force-dynamic';

/**
 * OAuth completes on the API; the browser lands here with the session cookie.
 * We validate the session server-side and redirect immediately — no client JS.
 */
export default async function AuthCallbackPage() {
  const session = await validateSession();

  if (session.ok) {
    redirect(routes.profile);
  }

  redirect(routes.signIn);
}
