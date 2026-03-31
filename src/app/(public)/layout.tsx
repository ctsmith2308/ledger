import { LandingMenuBar, LandingFooter } from '@/app/_widgets';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingMenuBar />

      <div className="pt-16">{children}</div>

      <LandingFooter />
    </div>
  );
}
