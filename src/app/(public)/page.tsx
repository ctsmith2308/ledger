import Link from 'next/link';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

import { ROUTES } from '@/app/_shared/routes';
import { decisions } from '@/app/_shared/content/architecture';
import { caseStudies } from '@/app/_shared/content/case-studies';

import { ContentCard } from '@/app/_widgets';

import { Button } from '@/app/_components';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left */}
          <div className="flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Portfolio project
              </span>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
                Architecture
                <br />
                is the
                <br />
                <span className="text-emerald-600">resume.</span>
              </h1>

              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                Ledger is a personal finance app built to production-grade
                standards — not to compete with Mint, but to demonstrate how I
                think about systems.
              </p>

              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                The feature set is a vehicle. The architectural decisions are
                the point.
              </p>
            </div>

            <div className="grid w-fit grid-cols-2 gap-3">
              <Button size="lg" asChild>
                <a
                  href="https://github.com/ctsmith2308/ledger"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  View source
                </a>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href={ROUTES.demoLogin}>
                  <ExternalLink className="size-4" />
                  Live demo
                </Link>
              </Button>
            </div>
          </div>

          <CodePreview />
        </div>
      </section>

      {/* Why this domain */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Why personal finance?
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Mint is dead. The space is crowded. That&apos;s not the point.
            Personal finance naturally justifies real architecture — bank
            connectivity requires compliance thinking, budgeting requires domain
            modelling, and multi-account aggregation requires event-driven
            design. The domain earns every pattern in the codebase. A todo app
            wouldn&apos;t.
          </p>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            If real users show up, the foundation is ready. Plaid is real. The
            infrastructure is production-grade. Compliance and cost would be the
            conversation at that point — not the architecture.
          </p>
        </div>
      </section>

      {/* Architecture decisions */}
      <section
        id="architecture"
        className="mx-auto max-w-7xl px-6 py-24 scroll-mt-16"
      >
        <div className="mb-12 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              The decisions worth talking about
            </h2>

            <p className="max-w-xl text-base text-muted-foreground">
              Every pattern here has a rationale. These are the answers to the
              &ldquo;why&rdquo; questions.
            </p>
          </div>

          <Link
            href={ROUTES.architecture}
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decisions.map(({ title, subtitle, slug, badge }) => (
            <ContentCard
              key={slug}
              href={`${ROUTES.architecture}/${slug}`}
              badge={badge}
              title={title}
              subtitle={subtitle}
            />
          ))}
        </div>

        <div className="mt-8 flex sm:hidden">
          <Link
            href={ROUTES.architecture}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all decisions
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* Case studies */}
      <section
        id="case-studies"
        className="border-t border-border bg-muted scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Case studies
              </h2>

              <p className="max-w-xl text-base text-muted-foreground">
                The pivots, the migrations, and the honest accounting of what
                was tried before the current approach.
              </p>
            </div>

            <Link
              href={ROUTES.caseStudies}
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map(({ slug, badge, title, subtitle }) => (
              <ContentCard
                key={slug}
                href={`${ROUTES.caseStudies}/${slug}`}
                badge={badge}
                title={title}
                subtitle={subtitle}
              />
            ))}
          </div>

          <div className="mt-8 flex sm:hidden">
            <Link
              href={ROUTES.caseStudies}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all case studies
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Explore the project
            </h2>

            <div className="grid w-fit grid-cols-2 gap-3">
              <Button size="lg" asChild>
                <a
                  href="https://github.com/ctsmith2308/ledger"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href={ROUTES.demoLogin}>
                  <ExternalLink className="size-4" />
                  Live demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

function CodePreview() {
  return (
    <div className="hidden items-center justify-center lg:flex">
      <div className="relative h-[460px] w-full max-w-lg overflow-hidden rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-800 shadow-2xl">
        <div className="absolute inset-0 p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />

            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />

            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex gap-2">
              <span className="text-zinc-500">01</span>
              <span className="text-zinc-500">{'// service signs — handlers never touch JWTs'}</span>
            </div>

            <div className="flex gap-2">
              <span className="text-zinc-500">02</span>
              <span className="text-emerald-400">const</span>
              <span className="text-blue-300">loginResult</span>
              <span className="text-zinc-400">=</span>
              <span className="text-yellow-300">await</span>
              <span className="text-zinc-200">commandBus</span>
            </div>

            <div className="flex gap-2 pl-8">
              <span className="text-zinc-500">03</span>
              <span className="text-zinc-400">.dispatch(</span>
              <span className="text-blue-300">new</span>
              <span className="text-emerald-300">LoginUserCommand</span>
              <span className="text-zinc-400">(email, pw));</span>
            </div>

            <div className="mt-2 flex gap-2">
              <span className="text-zinc-500">04</span>
              <span className="text-emerald-400">const</span>
              <span className="text-zinc-200">isSuccess</span>
              <span className="text-zinc-400">= loginResult.type ===</span>
              <span className="text-yellow-300">{`'SUCCESS'`}</span>
              <span className="text-zinc-400">;</span>
            </div>

            <div className="flex gap-2">
              <span className="text-zinc-500">05</span>
              <span className="text-emerald-400">const</span>
              <span className="text-zinc-200">purpose</span>
              <span className="text-zinc-400">= isSuccess ?</span>
              <span className="text-yellow-300">{`'access'`}</span>
              <span className="text-zinc-400">:</span>
              <span className="text-yellow-300">{`'mfa_challenge'`}</span>
              <span className="text-zinc-400">;</span>
            </div>

            <div className="mt-2 flex gap-2">
              <span className="text-zinc-500">06</span>
              <span className="text-emerald-400">const</span>
              <span className="text-blue-300">token</span>
              <span className="text-zinc-400">=</span>
              <span className="text-yellow-300">await</span>
              <span className="text-zinc-200">jwtService</span>
            </div>

            <div className="flex gap-2 pl-8">
              <span className="text-zinc-500">07</span>
              <span className="text-zinc-400">.sign(userId, purpose, ttl);</span>
            </div>

            <div className="mt-4 h-px w-full bg-zinc-700" />

            <div className="mt-2 flex gap-2">
              <span className="text-zinc-500">08</span>
              <span className="text-zinc-500">{'// feature flags cached in Upstash on login'}</span>
            </div>

            <div className="flex gap-2">
              <span className="text-zinc-500">09</span>
              <span className="text-emerald-400">const</span>
              <span className="text-blue-300">features</span>
              <span className="text-zinc-400">=</span>
              <span className="text-yellow-300">await</span>
              <span className="text-zinc-200">flagRepo</span>
            </div>

            <div className="flex gap-2 pl-8">
              <span className="text-zinc-500">10</span>
              <span className="text-zinc-400">.findEnabledByTier(user.tier);</span>
            </div>

            <div className="flex gap-2">
              <span className="text-zinc-500">11</span>
              <span className="text-yellow-300">await</span>
              <span className="text-zinc-200">flagCache</span>
              <span className="text-zinc-400">.setFeatures(userId, features);</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
