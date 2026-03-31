import { cn } from '@/app/_lib/tailwind';

function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn('flex animate-in fade-in duration-300 flex-col gap-6 p-6', className)}>
      {children}
    </main>
  );
}

export { PageContainer };
