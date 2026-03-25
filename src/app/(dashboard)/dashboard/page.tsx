function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Good morning 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Here&apos;s a summary of your finances.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Balance" value="$0.00" change="—" />
        <SummaryCard label="Monthly Spending" value="$0.00" change="—" />
        <SummaryCard label="Savings Goal" value="0%" change="—" />
      </div>

      {/* Recent transactions placeholder */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Transactions
          </h2>
          <span className="text-xs text-zinc-400">View all</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">
            No transactions yet
          </p>
          <p className="text-xs text-zinc-400">
            Connect an account to get started.
          </p>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{change}</p>
    </div>
  );
}

export default DashboardPage;
