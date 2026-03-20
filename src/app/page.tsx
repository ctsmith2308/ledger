import Link from 'next/link';
import { ExternalLink, Github, PlayCircle, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/app/_components';
import { LandingHeader, LandingFooter } from '@/app/_widgets';

const _architectureDecisions = [
  {
    slug: 'cqrs-command-bus',
    title: 'CQRS with a typed Command Bus',
    rationale:
      'Commands mutate state; queries return data. Each command self-registers against a bus using phantom types — dispatch() return types are inferred without a single explicit generic at the call site.',
  },
  {
    slug: 'modular-monolith',
    title: 'Modular monolith over microservices',
    rationale:
      'Premature service extraction is a cost, not a win. Domain boundaries are enforced at the module level. Splitting later is a refactor, not a rewrite.',
  },
  {
    slug: 'domain-driven-design',
    title: 'Domain-Driven Design',
    rationale:
      'Aggregates, value objects, domain events, and repositories — a finance domain has real invariants worth modelling explicitly. Email and Password validate at instantiation; the domain never holds invalid state.',
  },
  {
    slug: 'event-bus',
    title: 'In-process event bus',
    rationale:
      'Domain events are dispatched in-process today. The IEventBus interface means swapping to a durable queue is an infrastructure concern, not a domain rewrite.',
  },
  {
    slug: 'server-actions',
    title: 'Next.js server actions via createAction',
    rationale:
      'A single higher-order factory owns the catch boundary, session resolution, and error mapping. Every action is one consistent shape — no per-endpoint try/catch.',
  },
  {
    slug: 'fsd-frontend',
    title: 'Feature-Sliced Design (lite)',
    rationale:
      'Strict one-way dependency rules between layers keep the UI from becoming a ball of mud. Not pure FSD — the layering and dependency rules without the full specification overhead.',
  },
];

const _caseStudies = [
  {
    slug: 'trpc-vs-server-actions',
    badge: 'Migration',
    title: 'tRPC vs Next.js server actions',
    summary:
      'The project started with tRPC — end-to-end type safety and genuine framework portability. The switch to server actions was deliberate. Here is the honest accounting of what was gained, what was lost, and why the tradeoff was worth it.',
  },
  {
    slug: 'nuxt-to-nextjs',
    badge: 'Migration',
    title: 'Nuxt → Next.js migration',
    summary:
      'The project started in Nuxt 3 with a Vue frontend. The migration to Next.js was driven by ecosystem fit, not framework quality — and the domain-pure architecture meant the core never changed.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans dark:bg-zinc-900">
      <LandingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-36 pb-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left */}
          <div className="flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Portfolio project
              </span>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 lg:text-6xl dark:text-zinc-100">
                Architecture
                <br />
                is the
                <br />
                <span className="text-emerald-600">resume.</span>
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                Ledger is a personal finance app built to production-grade
                standards — not to compete with Mint, but to demonstrate how I
                think about systems.
              </p>
              <p className="max-w-md text-base leading-relaxed text-zinc-400 dark:text-zinc-500">
                The feature set is a vehicle. The architectural decisions are
                the point.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="https://github.com/ctsmith2308/ledger" target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  View source
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="size-4" />
                  Loom walkthrough
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/login">
                  <ExternalLink className="size-4" />
                  Live demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — code preview */}
          <div className="flex items-center justify-center">
            <div className="relative h-[460px] w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-2xl">
              <div className="absolute inset-0 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="flex gap-2">
                    <span className="text-zinc-500">01</span>
                    <span className="text-emerald-400">const</span>
                    <span className="text-blue-300">result</span>
                    <span className="text-zinc-400">=</span>
                    <span className="text-yellow-300">await</span>
                    <span className="text-zinc-200">commandBus</span>
                  </div>
                  <div className="flex gap-2 pl-8">
                    <span className="text-zinc-500">02</span>
                    <span className="text-zinc-400">.dispatch(</span>
                    <span className="text-blue-300">new</span>
                    <span className="text-emerald-300">LoginUserCommand</span>
                    <span className="text-zinc-400">(dto));</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-zinc-500">03</span>
                    <span className="text-zinc-500">{'//  ↑  return type inferred via phantom field'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500">04</span>
                    <span className="text-zinc-500">{'//  no explicit generic needed'}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-zinc-500">05</span>
                    <span className="text-emerald-400">const</span>
                    <span className="text-zinc-400">{'{ jwt } = result'}</span>
                  </div>
                  <div className="flex gap-2 pl-8">
                    <span className="text-zinc-500">06</span>
                    <span className="text-zinc-400">.getValueOrThrow();</span>
                  </div>
                  <div className="mt-4 h-px w-full bg-zinc-700" />
                  <div className="flex gap-2 mt-2">
                    <span className="text-zinc-500">07</span>
                    <span className="text-emerald-400">class</span>
                    <span className="text-yellow-300">LoginUserCommand</span>
                  </div>
                  <div className="flex gap-2 pl-8">
                    <span className="text-zinc-500">08</span>
                    <span className="text-blue-300">extends</span>
                    <span className="text-emerald-300">Command</span>
                    <span className="text-zinc-400">{'<LoginUserResponse>'}</span>
                  </div>
                  <div className="flex gap-2 pl-8">
                    <span className="text-zinc-500">09</span>
                    <span className="text-zinc-500">{'// phantom: declare _response: T'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why this domain */}
      <section className="border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Why personal finance?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            Mint is dead. The space is crowded. That&apos;s not the point. Personal
            finance naturally justifies real architecture — bank connectivity
            requires compliance thinking, budgeting requires domain modelling,
            and multi-account aggregation requires event-driven design. The
            domain earns every pattern in the codebase. A todo app wouldn&apos;t.
          </p>
          <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            If real users show up, the foundation is ready. Plaid is real. The
            infrastructure is production-grade. Compliance and cost would be
            the conversation at that point — not the architecture.
          </p>
        </div>
      </section>

      {/* Architecture decisions */}
      <section id="architecture" className="mx-auto max-w-7xl px-6 py-24 scroll-mt-16">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              The decisions worth talking about
            </h2>
            <p className="max-w-xl text-base text-zinc-500 dark:text-zinc-400">
              Every pattern here has a rationale. These are the answers to the
              &ldquo;why&rdquo; questions.
            </p>
          </div>
          <Link
            href="/architecture"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-700 sm:flex dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {_architectureDecisions.map(({ title, rationale, slug }) => (
            <Link
              key={slug}
              href={`/architecture/${slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="h-1.5 w-8 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{rationale}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex sm:hidden">
          <Link
            href="/architecture"
            className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            View all decisions
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* Case studies */}
      <section id="case-studies" className="border-t border-zinc-100 bg-zinc-50 scroll-mt-16 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Case studies
              </h2>
              <p className="max-w-xl text-base text-zinc-500 dark:text-zinc-400">
                The pivots, the migrations, and the honest accounting of what
                was tried before the current approach.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {_caseStudies.map(({ slug, badge, title, summary }) => (
              <Link
                key={slug}
                href={`/case-studies/${slug}`}
                className="group flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  {badge}
                </span>
                <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-zinc-100">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{summary}</p>
                <span className="mt-auto flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors group-hover:text-emerald-600 dark:text-zinc-500">
                  Read case study
                  <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Explore the project
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <a href="https://github.com/ctsmith2308/ledger" target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="size-4" />
                  Loom walkthrough
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/login">
                  <ExternalLink className="size-4" />
                  Live demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
