import { cn } from '@/app/_shared/lib/tailwind';
import { HeaderProps } from './types';

function Header({ size, children, className }: HeaderProps) {
  const headerSizeClass = {
    1: 'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
    2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  };

  return <h1 className={cn(headerSizeClass[size], className)}>{children}</h1>;
}

export { Header };
