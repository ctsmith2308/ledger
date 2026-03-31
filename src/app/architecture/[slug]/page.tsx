import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/app/_shared/routes';
import { getDecision, getSlugs, decisions } from '@/app/_shared/content/architecture';
import { caseStudies } from '@/app/_shared/content/case-studies';

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}

export default async function ArchitectureDecisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decision = getDecision(slug);
  if (!decision) notFound();

  const { title, subtitle, badge, context, decision: dec, rationale, tradeoffs, codeBlocks } = decision;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex gap-12">
        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href={ROUTES.architecture} className="transition-colors hover:text-foreground">Architecture</Link>
            <span>/</span>
            <span className="text-foreground">{title}</span>
          </div>

          <div className="mb-12 flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              {badge}
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-12">
            <Section heading="Context">
              <p className="text-base leading-relaxed text-muted-foreground">{context}</p>
            </Section>

            <Section heading="The decision">
              <p className="text-base leading-relaxed text-muted-foreground">{dec}</p>
            </Section>

            <Section heading="Rationale">
              <ul className="flex flex-col gap-3">
                {rationale.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {i + 1}
                    </span>

                    <p className="text-base leading-relaxed text-muted-foreground">{point}</p>
                  </li>
                ))}
              </ul>
            </Section>

            {codeBlocks.length > 0 && (
              <Section heading="In the codebase">
                <div className="flex flex-col gap-6">
                  {codeBlocks.map(({ label, code }) => (
                    <div key={label} className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">{label}</p>

                      <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-5 py-4 text-xs leading-relaxed text-zinc-200 dark:bg-zinc-800">
                        <code>{code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section heading="Tradeoffs">
              <div className="flex flex-col gap-4">
                {tradeoffs.map(({ pro, con }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted p-4 sm:grid-cols-2"
                  >
                    <div className="flex gap-2">
                      <span className="mt-0.5 text-emerald-500">↑</span>

                      <p className="text-sm leading-relaxed text-muted-foreground">{pro}</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="mt-0.5 text-muted-foreground">↓</span>

                      <p className="text-sm leading-relaxed text-muted-foreground">{con}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <Link
              href={ROUTES.architecture}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All architecture decisions
            </Link>
          </div>
        </main>

        {/* Sidebar navigation */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Architecture
              </p>

              <ul className="space-y-1">
                {decisions.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/architecture/${d.slug}`}
                      className={`block truncate rounded-md px-2 py-1.5 text-xs transition-colors ${
                        d.slug === slug
                          ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Case Studies
              </p>

              <ul className="space-y-1">
                {caseStudies.map((cs) => (
                  <li key={cs.slug}>
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="block truncate rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {cs.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {heading}
      </h2>

      {children}
    </section>
  );
}
