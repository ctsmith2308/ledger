import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/app/_widgets';
import { getSession } from '@/app/_lib/services/session.service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getSession();

  if (result.isFailure) {
    const error = result.error.type;

    // REPACKAGE: Redirect for any "Auth" related domain exception
    if (
      error === 'UNAUTHORIZED' ||
      error === 'SESSION_EXPIRED' ||
      error === 'SESSION_REVOKED'
    ) {
      redirect('/login');
    }

    // Bubble up to error.tsx for other errors.
    throw error;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader />
      <div className="pt-14">{children}</div>
    </div>
  );
}
