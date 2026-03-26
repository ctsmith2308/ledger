import Link from 'next/link';
import { Button } from '@/app/_components';
import { ThemeToggle } from './theme-toggle';

function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600">
            <span className="text-sm font-bold text-white">L</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ledger
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#architecture">Architecture</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#case-studies">Case Studies</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/ctsmith2308/ledger" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link href="/login">View demo</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export { LandingHeader };
