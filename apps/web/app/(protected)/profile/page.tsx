import ProfileDashboard from './ProfileDashboard';
import { requireAuth } from '@/lib/auth';

// force to render on every request
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireAuth();

  return <ProfileDashboard user={user} />;
}
