'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Linkedin, Menu } from 'lucide-react';

import { ROUTES } from '@/app/_shared/routes';

import { ThemeToggle } from '@/app/_features/theme/ui/theme-toggle';

import {
  Button,
  Dialog,
  DialogContent,
  MenuBar,
} from '@/app/_components';

function LandingMenuBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClose = () => setDrawerOpen(false);

  return (
    <>
      <MenuBar
        left={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5 text-muted-foreground" />
          </Button>
        }
        right={
          <>
            <div className="hidden items-center gap-1 md:flex">
              <NavLinks />
            </div>

            <ThemeToggle size="icon-sm" />

            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link href={ROUTES.demoLogin}>View demo</Link>
            </Button>
          </>
        }
      />

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          className="fixed inset-y-0 left-0 top-0 h-full w-72 max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-xl pt-6 sm:max-w-none"
          showCloseButton={false}
        >
          <nav className="flex flex-col gap-2 px-2">
            <Link
              href="/#architecture"
              onClick={handleClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Architecture
            </Link>

            <Link
              href="/#case-studies"
              onClick={handleClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Case Studies
            </Link>

            <a
              href="https://github.com/ctsmith2308/ledger"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/christopher-smith-2308"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="size-4" />
              LinkedIn
            </a>

            <div className="mt-2 px-3">
              <Button size="sm" className="w-full" asChild>
                <Link href={ROUTES.demoLogin} onClick={handleClose}>
                  View demo
                </Link>
              </Button>
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NavLinks() {
  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/#architecture">Architecture</Link>
      </Button>

      <Button variant="ghost" size="sm" asChild>
        <Link href="/#case-studies">Case Studies</Link>
      </Button>

      <Button variant="ghost" size="icon-sm" asChild>
        <a
          href="https://github.com/ctsmith2308/ledger"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Github className="size-4" />
        </a>
      </Button>

      <Button variant="ghost" size="icon-sm" asChild>
        <a
          href="https://www.linkedin.com/in/christopher-smith-2308"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin className="size-4" />
        </a>
      </Button>
    </>
  );
}

export { LandingMenuBar };
