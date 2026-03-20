import Link from 'next/link';

const _projectLinks = [
  { label: 'GitHub', href: 'https://github.com/ctsmith2308/ledger', external: true },
  { label: 'Live demo', href: '/login', external: false },
  { label: 'Loom walkthrough', href: '#', external: true },
];

const _architectureLinks = [
  { label: 'CQRS & Command Bus', href: '/architecture/cqrs-command-bus', external: false },
  { label: 'Modular monolith', href: '/architecture/modular-monolith', external: false },
  { label: 'Domain-Driven Design', href: '/architecture/domain-driven-design', external: false },
  { label: 'FSD frontend', href: '/architecture/fsd-frontend', external: false },
];

const _caseStudyLinks = [
  { label: 'Nuxt → Next.js migration', href: '/case-studies/nuxt-to-nextjs', external: false },
  { label: 'tRPC vs server actions', href: '/case-studies/trpc-vs-server-actions', external: false },
];

const _legalLinks = [
  { label: 'Privacy Policy', href: '#', external: false },
  { label: 'Terms of Service', href: '#', external: false },
];

function LandingFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
                <span className="text-xs font-bold text-white">L</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Ledger
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              A portfolio project built to production-grade standards.
              The feature set is a vehicle. The architecture is the point.
            </p>
          </div>

          {/* Project */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Project
            </p>
            <ul className="flex flex-col gap-2">
              {_projectLinks.map(({ label, href, external }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Architecture
            </p>
            <ul className="flex flex-col gap-2">
              {_architectureLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Case Studies + Legal */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Case Studies
              </p>
              <ul className="flex flex-col gap-2">
                {_caseStudyLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Legal
              </p>
              <ul className="flex flex-col gap-2">
                {_legalLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 sm:flex-row dark:border-zinc-800">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Ledger. Portfolio project.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Demonstrating production-grade thinking through a deliberately chosen domain.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { LandingFooter };
