import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { decisions } from '@/app/_lib/content/architecture';

export default function ArchitecturePage() {
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
          Architecture
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          The decisions worth talking about
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground">
          Every pattern in this codebase has a rationale. These are the answers
          to the &ldquo;why&rdquo; questions — context, decision, tradeoffs, and the
          code that resulted.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {decisions.map(({ slug, title, subtitle, badge }) => (
          <Link
            key={slug}
            href={`/architecture/${slug}`}
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
