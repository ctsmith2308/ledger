import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

import { Button } from '@/app/_components';
import { ROUTES } from '@/app/_shared/routes';

import { SiteHeader } from '@/app/_components';
import { ThemeToggle } from '@/app/_features/theme/ui/theme-toggle';

function LandingHeader() {
  return (
    <SiteHeader
      left={
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#architecture">Architecture</Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/#case-studies">Case Studies</Link>
          </Button>
        </>
      }
      right={
        <>
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

          <Button size="sm" asChild>
            <Link href={ROUTES.demoLogin}>View demo</Link>
          </Button>
        </>
      }
    />
  );
}

export { LandingHeader };
