import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Authenticated segment: gate here so unauthenticated users never render nested UI.
 * Pages that need the user call `requireAuth()` again — same request, cached session.
 */
export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  return (
    <section
      className="text-foreground w-full max-w-lg px-4"
      aria-label="Authenticated content"
    >
      {children}
    </section>
  );
}
