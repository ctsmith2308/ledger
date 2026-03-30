import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ROUTES } from '@/app/_lib/config';

import { calcTotalsByType } from '@/app/_entities/banking';
import {
  calcMonthlySpending,
  calcWeeklySpending,
} from '@/app/_entities/transactions';
import { loadOverview } from '@/app/_entities/shared';

import { TransactionList } from '@/app/_features/transactions';
import { ConnectAccountCard } from '@/app/_features/plaid';
import { AccountTotalsTable } from '@/app/_features/accounts';

import { PageContainer, PageHeader, SummaryCard } from '@/app/_widgets';

async function OverviewPage() {
  const { profile, accounts, transactions } = await loadOverview();

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

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Monthly Spending"
          value={hasAccounts ? `$${monthlySpending.toFixed(2)}` : '—'}
        />

        <SummaryCard
          label="This Week's Spending"
          value={hasAccounts ? `$${weeklySpending.toFixed(2)}` : '—'}
        />
      </div>

      {!hasAccounts && <ConnectAccountCard />}

      {hasAccounts && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Transactions
            </h2>

            <Link
              href={ROUTES.transactions}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <TransactionList transactions={transactions.slice(0, 10)} />
        </div>
      )}

      {hasAccounts && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Account Totals
            </h2>

            <Link
              href={ROUTES.accounts}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <AccountTotalsTable totals={accountTotals} limit={4} />
        </div>
      )}
    </PageContainer>
  );
}

export default OverviewPage;
