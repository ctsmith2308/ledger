import { DashboardHeader } from '@/app/_widgets';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader />
      <div className="pt-14">{children}</div>
    </div>
  );
}
