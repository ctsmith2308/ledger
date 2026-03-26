function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export { SummaryCard };
