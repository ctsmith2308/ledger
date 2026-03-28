import { redirect } from 'next/navigation';

import { execute, ActionError } from '@/app/_lib/safe-action';
import { ROUTES } from '@/app/_lib/config';

import { getUserSessionAction } from '@/app/_entities/identity';

import { DashboardSidebar } from '@/app/_widgets';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await execute(getUserSessionAction());
  } catch (error) {
    if (
      error instanceof ActionError &&
      error.code === 'UNAUTHORIZED'
    ) {
      redirect(ROUTES.login);
    }

    throw error;
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <DashboardSidebar>
        {children}
      </DashboardSidebar>
    </div>
  );
}
