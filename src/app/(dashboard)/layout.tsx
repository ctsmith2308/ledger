import { AppMenuBar, NavSidebar, MobileNavDrawer } from '@/app/_widgets';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <AppMenuBar left={<MobileNavDrawer />} />

      <div className="mx-auto mt-14 flex h-[calc(100vh-3.5rem-1.5rem)] max-w-7xl gap-6 px-6 py-3">
        <aside className="hidden w-56 shrink-0 rounded-xl border border-border bg-card lg:block">
          <NavSidebar />
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card">
          {children}
        </div>
      </div>
    </div>
  );
}
