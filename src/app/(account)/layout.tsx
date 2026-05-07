import { AppMenuBar } from '@/app/_widgets';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppMenuBar />

      <div className="pt-14">{children}</div>
    </div>
  );
}
