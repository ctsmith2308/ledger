import Link from 'next/link';

function ContentCard({
  href,
  badge,
  title,
  subtitle,
}: {
  href: string;
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
        {badge}
      </span>

      <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-emerald-700">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </Link>
  );
}

export { ContentCard };
