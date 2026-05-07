import { redirect } from 'next/navigation';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { identityService } from '@/core/modules/identity';

import { bankingService } from '@/core/modules/banking';

import { transactionsService } from '@/core/modules/transactions';

import { DomainException } from '@/core/shared/domain';

import { ROUTES } from '@/app/_shared/routes';

import { getQueryClient } from '@/app/_shared/lib/query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AuthManager } from '@/app/_shared/lib/session';

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
  try {
    const queryClient = getQueryClient();
    const { userId } = await AuthManager.getSession();

    const [account, accounts, transactions] = await Promise.all([
      identityService.getUserAccount(userId),
      bankingService.getAccounts(userId),
      transactionsService.getTransactions(userId),
    ]);

    queryClient.setQueryData(queryKeys.userAccount, account);

    queryClient.setQueryData(queryKeys.featureFlags, account.features);

    return { queryClient, account, accounts, transactions };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function OverviewPage() {
  const { queryClient, account, accounts, transactions } =
    await loadOverviewData();

  const hasAccounts = accounts.length > 0;
  const monthlyByCategory = calcMonthlySpendingByCategory(transactions);
  const weeklyByCategory = calcWeeklySpendingByCategory(transactions);
  const accountTotals = calcTotalsByType(accounts);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
}

export default OverviewPage;
