import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { identityService } from '@/core/modules/identity';

import { bankingService } from '@/core/modules/banking';

import { transactionsService } from '@/core/modules/transactions';

import { ROUTES } from '@/app/_shared/routes';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import { calcTotalsByType } from '@/app/_entities/banking/lib';

import {
  calcMonthlySpendingByCategory,
  calcWeeklySpendingByCategory,
} from '@/app/_entities/transactions/lib';

import { TransactionList } from '@/app/_widgets';

import { ConnectAccountCard } from '@/app/_features/plaid';

import { AccountTotalsTable } from '@/app/_features/accounts';

import { SpendingDoughnut } from '@/app/_features/transactions';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadOverviewData = async () => {
  const session = await loadSession();

  const [account, accounts, transactions] = await Promise.all([
    identityService.getUserAccount(session.userId),
    bankingService.getAccounts(session.userId),
    transactionsService.getTransactions(session.userId),
  ]);

  return { account, accounts, transactions };
};

async function OverviewPage() {
  const { account, accounts, transactions } = await loadOverviewData();

  const hasAccounts = accounts.length > 0;
  const monthlyByCategory = calcMonthlySpendingByCategory(transactions);
  const weeklyByCategory = calcWeeklySpendingByCategory(transactions);
  const accountTotals = calcTotalsByType(accounts);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${account.firstName}`}
        description="Here's a summary of your finances."
      />

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            This Week&apos;s Spending
          </h2>

          <SpendingDoughnut data={hasAccounts ? weeklyByCategory : []} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Monthly Spending
            </h2>

            <Link
              href={ROUTES.spendingHabits}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <SpendingDoughnut data={hasAccounts ? monthlyByCategory : []} />
        </div>
      </div>

      {!hasAccounts && <ConnectAccountCard />}

      {hasAccounts && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
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
