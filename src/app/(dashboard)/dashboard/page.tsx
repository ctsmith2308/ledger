'use client';

import { SummaryCard } from '@/app/_widgets';
import { useAccounts, ConnectAccountCard } from '@/app/_features/accounts';
import {
  useTransactions,
  TransactionList,
} from '@/app/_features/transactions';

function DashboardPage() {
  const accounts = useAccounts();
  const transactions = useTransactions();

  const accountList =
    accounts.data?.success ? accounts.data.data : [];
  const transactionList =
    transactions.data?.success ? transactions.data.data : [];

  const totalBalance = accountList.reduce(
    (sum, a) => sum + (a.currentBalance ?? 0),
    0,
  );

  const monthlySpending = _calcMonthlySpending(transactionList);

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
          value={String(accountList.length)}
        />
      </div>

      {accountList.length === 0 &&
        !accounts.isLoading &&
        <ConnectAccountCard />}

      <TransactionList transactions={transactionList.slice(0, 5)} />
    </main>
  );
}

const _calcMonthlySpending = (
  transactions: { date: string; amount: number }[],
): number => {
  const now = new Date();
  return transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear() &&
        tx.amount > 0
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export default DashboardPage;
