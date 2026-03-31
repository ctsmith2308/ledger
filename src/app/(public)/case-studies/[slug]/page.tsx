import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCaseStudy, getCaseSlugs, caseStudies } from '@/app/_shared/content/case-studies';
import { decisions } from '@/app/_shared/content/architecture';

export function generateStaticParams() {
  return getCaseSlugs().map((slug) => ({ slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const { title, subtitle, badge, summary, sections } = study;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex gap-12">
        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>

            <span>/</span>

            <span className="text-foreground">Case Studies</span>

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

            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{summary}</p>
          </div>

          <div className="flex flex-col gap-12">
            {sections.map(({ heading, body, table, code }) => (
              <section key={heading} className="flex flex-col gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {heading}
                </h2>

                <p className="text-base leading-relaxed text-muted-foreground">{body}</p>

                {table && (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {table.headers.map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className={`px-4 py-3 text-sm leading-relaxed ${
                                  j === 0
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {code && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">{code.label}</p>

                    <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-5 py-4 text-xs leading-relaxed text-zinc-200 dark:bg-zinc-800">
                      <code>{code.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
        </main>

        {/* Sidebar navigation */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Case Studies
              </p>

              <ul className="space-y-1">
                {caseStudies.map((cs) => (
                  <li key={cs.slug}>
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className={`block truncate rounded-md px-2 py-1.5 text-xs transition-colors ${
                        cs.slug === slug
                          ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cs.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Architecture
              </p>

              <ul className="space-y-1">
                {decisions.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/architecture/${d.slug}`}
                      className="block truncate rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {d.title}
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
