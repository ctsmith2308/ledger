import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

import { decisions } from '@/app/_shared/content/architecture';
import { caseStudies } from '@/app/_shared/content/case-studies';

const _projectLinks = [
  { label: 'GitHub', href: 'https://github.com/ctsmith2308/ledger', external: true },
  { label: 'Live demo', href: '/demo-login', external: false },
  { label: 'Loom walkthrough', href: '#', external: true },
];

function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
                <span className="text-xs font-bold text-white">L</span>
              </div>

              <span className="text-sm font-semibold text-foreground">
                Ledger
              </span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A portfolio project built to production-grade standards.
              The feature set is a vehicle. The architecture is the point.
            </p>
          </div>

          {/* Project */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Project
            </p>

            <ul className="flex flex-col gap-2">
              {_projectLinks.map(({ label, href, external }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Architecture
            </p>

            <ul className="flex flex-col gap-2">
              {decisions.map(({ slug, title }) => (
                <li key={slug}>
                  <Link
                    href={`/architecture/${slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Case Studies */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Case Studies
            </p>

            <ul className="flex flex-col gap-2">
              {caseStudies.map(({ slug, title }) => (
                <li key={slug}>
                  <Link
                    href={`/case-studies/${slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ledger. Portfolio project.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ctsmith2308/ledger"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
            </a>

            <a
              href="https://www.linkedin.com/in/christopher-smith-2308"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { LandingFooter };
