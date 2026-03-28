import { cn } from '@/app/_lib/tailwind';

function List({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ListHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-b border-border px-5 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ListTitle({
  className,
  children,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

function ListContent({
  className,
  children,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('divide-y divide-border', className)}
      {...props}
    >
      {children}
    </ul>
  );
}

function ListItem({
  className,
  children,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      className={cn(
        'flex items-center justify-between px-5 py-3',
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

export { List, ListHeader, ListTitle, ListContent, ListItem };
