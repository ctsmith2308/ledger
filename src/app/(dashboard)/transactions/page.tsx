import { execute } from '@/app/_lib/safe-action';

import { getTransactionsAction } from '@/app/_entities/transactions';

import { TransactionList } from '@/app/_features/transactions';

async function TransactionsPage() {
  const transactions = await execute(getTransactionsAction());

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Transactions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          View and manage your transaction history.
        </p>
      </div>

      {transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-zinc-500">
              No transactions yet
            </p>
            <p className="text-xs text-zinc-400">
              Connect an account and sync to see transactions.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default TransactionsPage;
