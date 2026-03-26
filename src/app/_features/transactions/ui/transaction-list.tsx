import { type TransactionDTO } from '@/core/modules/transactions';

function TransactionList({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">
          All Transactions
        </h2>
      </div>

      <ul className="divide-y divide-zinc-100">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">
                {tx.merchantName ?? tx.name}
              </span>
              <span className="text-xs text-zinc-400">
                {tx.date.split('T')[0]}
                {tx.category ? ` · ${tx.category}` : ''}
              </span>
            </div>
            <span
              className={`text-sm font-semibold ${tx.amount > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {tx.amount > 0 ? '-' : '+'}$
              {Math.abs(tx.amount).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { TransactionList };
