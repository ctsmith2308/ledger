import { LandingHeader, LandingFooter } from '@/app/_widgets';

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <LandingHeader />
      <div className="pt-16">{children}</div>
      <LandingFooter />
    </div>
  );
}
