import { PublicHeader } from '@/app/_widgets';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex flex-1 items-center justify-center px-4 pt-16 py-12">
        {children}
      </main>
    </div>
  );
}
