import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCaseStudy, getCaseSlugs } from '@/app/_lib/content/case-studies';

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
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Breadcrumb */}
      <div className="mb-10 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/" className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">Home</Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-400">Case Studies</span>
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
        <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">{summary}</p>
      </div>

      <div className="flex flex-col gap-12">
        {sections.map(({ heading, body, table, code }) => (
          <section key={heading} className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {heading}
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">{body}</p>

            {table && (
              <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-700">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      {table.headers.map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                    {table.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-4 py-3 text-sm leading-relaxed ${
                              j === 0
                                ? 'font-medium text-zinc-700 dark:text-zinc-200'
                                : 'text-zinc-500 dark:text-zinc-400'
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
                <p className="text-xs font-medium text-zinc-400">{code.label}</p>
                <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-5 py-4 text-xs leading-relaxed text-zinc-200">
                  <code>{code.code}</code>
                </pre>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Footer nav */}
      <div className="mt-16 border-t border-zinc-100 pt-8 dark:border-zinc-800">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
