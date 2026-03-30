import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { identityController } from '@/core/modules/identity';
import { type JwtData, UnauthorizedException } from '@/core/shared/domain';
import { bankingController } from '@/core/modules/banking';
import { transactionsController } from '@/core/modules/transactions';

import { ROUTES } from '@/app/_lib/config';
import { getQueryClient } from '@/app/_lib/query';

import { queryKeys } from '@/app/_entities/shared';
import { calcTotalsByType } from '@/app/_entities/banking';
import {
  calcMonthlySpending,
  calcWeeklySpending,
} from '@/app/_entities/transactions';

import { TransactionList } from '@/app/_features/transactions';
import { ConnectAccountCard } from '@/app/_features/plaid';
import { AccountTotalsTable } from '@/app/_features/accounts';

import { PageContainer, PageHeader, SummaryCard } from '@/app/_widgets';

const loadOverviewData = async () => {
  const queryClient = getQueryClient();
  const session = queryClient.getQueryData<JwtData>(queryKeys.session);
  if (!session) throw new UnauthorizedException();

  const [profileResult, accountsResult, transactionsResult] =
    await Promise.all([
      identityController.getUserProfile(session.userId),
      bankingController.getAccounts(session.userId),
      transactionsController.getTransactions(session.userId),
    ]);

  const profile = profileResult.getValueOrThrow();
  const accounts = accountsResult.getValueOrThrow();
  const transactions = transactionsResult.getValueOrThrow();

  queryClient.setQueryData(queryKeys.profile, profile);
  queryClient.setQueryData(queryKeys.accounts, accounts);
  queryClient.setQueryData(queryKeys.transactions, transactions);

  return { profile, accounts, transactions };
};

async function OverviewPage() {
  const { profile, accounts, transactions } = await loadOverviewData();

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
