'use client';

import { useState } from 'react';

import { Dialog, DialogContent } from '@/app/_components';

import { AppHeader, NavSidebar } from '@/app/_widgets';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <AppHeader onMenuToggle={() => setDrawerOpen(true)} />

      <div className="mx-auto mt-14 flex h-[calc(100vh-3.5rem-1.5rem)] max-w-7xl gap-6 px-6 py-3">
        <aside className="hidden w-56 shrink-0 rounded-xl border border-border bg-card lg:block">
          <NavSidebar />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card">
          {children}
        </div>
      </div>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          className="fixed inset-y-0 left-0 top-0 h-full w-72 max-w-none -translate-x-0 -translate-y-0 rounded-none rounded-r-xl pt-4 sm:max-w-none"
          showCloseButton={false}
        >
          <NavSidebar onNavigate={() => setDrawerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { DashboardLayout };
