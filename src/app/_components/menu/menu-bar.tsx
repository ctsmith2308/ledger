import Link from 'next/link';

function MenuBar({
  logoHref = '/',
  left,
  right,
}: {
  logoHref?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {left}
          <Link href={logoHref} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
              <span className="text-xs font-bold text-white">L</span>
            </div>

            <span className="text-sm font-semibold tracking-tight text-foreground">
              Ledger
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">{right}</div>
      </div>
    </header>
  );
}

export { MenuBar };
