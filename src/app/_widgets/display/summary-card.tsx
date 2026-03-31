function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="text-xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export { SummaryCard };
