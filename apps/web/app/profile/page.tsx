import { redirect } from 'next/navigation';
import ProfileDashboard from './ProfileDashboard';
import { validateSession } from '@/lib/validate-session';
import { routes } from '@/lib/routes';

// force to render on every request
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await validateSession();

  if (!session.ok) {
    redirect(routes.signIn);
  }

  return <ProfileDashboard user={session.user} />;
}
