import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDecision, getSlugs } from '@/app/_lib/content/architecture';

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
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Breadcrumb */}
      <div className="mb-10 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/" className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">Home</Link>
        <span>/</span>
        <Link href="/architecture" className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">Architecture</Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-400">{title}</span>
      </div>

      {/* Header */}
      <div className="mb-12 flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          {badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-12">
        {/* Context */}
        <Section heading="Context">
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">{context}</p>
        </Section>

        {/* Decision */}
        <Section heading="The decision">
          <p className="text-base leading-relaxed text-zinc-600">{dec}</p>
        </Section>

        {/* Rationale */}
        <Section heading="Rationale">
          <ul className="flex flex-col gap-3">
            {rationale.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  {i + 1}
                </span>
                <p className="text-base leading-relaxed text-zinc-600">{point}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Code blocks */}
        {codeBlocks.length > 0 && (
          <Section heading="In the codebase">
            <div className="flex flex-col gap-6">
              {codeBlocks.map(({ label, code }) => (
                <div key={label} className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-zinc-400">{label}</p>
                  <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-5 py-4 text-xs leading-relaxed text-zinc-200">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tradeoffs */}
        <Section heading="Tradeoffs">
          <div className="flex flex-col gap-4">
            {tradeoffs.map(({ pro, con }, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-2 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex gap-2">
                  <span className="mt-0.5 text-emerald-500">↑</span>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{pro}</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5 text-zinc-400">↓</span>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{con}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer nav */}
      <div className="mt-16 border-t border-zinc-100 pt-8 dark:border-zinc-800">
        <Link
          href="/architecture"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← All architecture decisions
        </Link>
      </div>
    </main>
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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {heading}
      </h2>
      {children}
    </section>
  );
}
