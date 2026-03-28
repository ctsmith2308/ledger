import { redirect } from 'next/navigation';

import { execute, ActionError } from '@/app/_lib/safe-action';

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
      redirect('/login');
    }

    throw error;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      {/* pt-14 clears the fixed header, lg:pl-60 clears the sidebar */}
      <div className="pt-14 lg:pl-60">
        {children}
      </div>
    </div>
  );
}
