import { SummaryCard } from '@/app/_widgets';
import {
  getAccountsAction,
  calcTotalBalance,
  ConnectAccountCard,
} from '@/app/_features/accounts';
import {
  getTransactionsAction,
  calcMonthlySpending,
  TransactionList,
} from '@/app/_features/transactions';
import { execute } from '@/app/_lib/safe-action';

async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    execute(getAccountsAction()),
    execute(getTransactionsAction()),
  ]);

  const totalBalance = calcTotalBalance(accounts);
  const monthlySpending = calcMonthlySpending(transactions);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Here&apos;s a summary of your finances.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Balance"
          value={`$${totalBalance.toFixed(2)}`}
        />
        <SummaryCard
          label="Monthly Spending"
          value={`$${monthlySpending.toFixed(2)}`}
        />
        <SummaryCard
          label="Linked Accounts"
          value={String(accounts.length)}
        />
      </div>

      {accounts.length === 0 && <ConnectAccountCard />}

      <TransactionList transactions={transactions.slice(0, 5)} />
    </main>
  );
}

export default DashboardPage;
