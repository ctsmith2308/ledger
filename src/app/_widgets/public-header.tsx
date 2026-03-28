import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

import { Button } from '@/app/_components';
import { ThemeToggle } from './theme-toggle';

function PublicHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600">
            <span className="text-sm font-bold text-white">L</span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-foreground">
            Ledger
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {children}

          <Button variant="ghost" size="icon-sm" asChild>
            <a href="https://github.com/ctsmith2308/ledger" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="size-4" />
            </a>
          </Button>

          <Button variant="ghost" size="icon-sm" asChild>
            <a href="https://www.linkedin.com/in/christopher-smith-2308" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="size-4" />
            </a>
          </Button>

          <ThemeToggle size="icon-sm" />
        </nav>
      </div>
    </header>
  );
}

export { PublicHeader };
