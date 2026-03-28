import { cn } from '@/app/_lib/tailwind';

function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn('px-6 py-6', className)}>
      {children}
    </main>
  );
}

export { PageContainer };
