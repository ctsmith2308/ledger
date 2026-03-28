import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { execute } from '@/app/_lib/safe-action';

import { getUserProfileAction } from '@/app/_entities/identity';
import { getAccountsAction, calcTotalsByType } from '@/app/_entities/banking';
import {
  getTransactionsAction,
  calcMonthlySpending,
  calcWeeklySpending,
} from '@/app/_entities/transactions';

import { TransactionList } from '@/app/_features/transactions';
import { ConnectAccountCard } from '@/app/_features/plaid';

import { PageContainer, PageHeader } from '@/app/_widgets';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/app/_components';

async function DashboardPage() {
  const [profile, accounts, transactions] = await Promise.all([
    execute(getUserProfileAction()),
    execute(getAccountsAction()),
    execute(getTransactionsAction()),
  ]);

  const hasAccounts = accounts.length > 0;
  const monthlySpending = calcMonthlySpending(transactions);
  const weeklySpending = calcWeeklySpending(transactions);
  const accountTotals = calcTotalsByType(accounts);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${profile.firstName}`}
        description="Here's a summary of your finances."
      />

      {/* Spending callouts */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Monthly Spending
          </p>

          <p className="mt-1 text-xl font-semibold text-foreground">
            {hasAccounts ? `$${monthlySpending.toFixed(2)}` : '—'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This Week&apos;s Spending
          </p>

          <p className="mt-1 text-xl font-semibold text-foreground">
            {hasAccounts ? `$${weeklySpending.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      {!hasAccounts && <ConnectAccountCard />}

      {/* Recent transactions */}
      {hasAccounts && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Transactions
            </h2>

            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <TransactionList transactions={transactions.slice(0, 5)} />
        </div>
      )}

      {/* Account totals by type */}
      {hasAccounts && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Account Totals
            </h2>

            <Link
              href="/accounts"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>

                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {accountTotals.map((row) => (
                  <TableRow key={row.type}>
                    <TableCell className="font-medium text-foreground">
                      {row.type}
                    </TableCell>

                    <TableCell
                      className={`text-right font-semibold ${row.isLiability ? 'text-red-600' : 'text-green-600'}`}
                    >
                      ${row.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default DashboardPage;
