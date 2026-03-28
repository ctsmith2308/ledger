import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { caseStudies } from '@/app/_lib/content/case-studies';

export default function CaseStudiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </Link>

        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          Case Studies
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          The pivots and migrations
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground">
          The honest accounting of what was tried before the current approach —
          what worked, what didn&apos;t, and why it changed.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {caseStudies.map(({ slug, title, subtitle, badge }) => (
          <Link
            key={slug}
            href={`/case-studies/${slug}`}
            className="group flex items-start justify-between gap-6 py-6 transition-colors hover:text-foreground"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-emerald-600">
                {badge}
              </span>

              <h2 className="text-base font-semibold text-foreground transition-colors group-hover:text-emerald-700">
                {title}
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>

            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-500" />
          </Link>
        ))}
      </div>
    </main>
  );
}
