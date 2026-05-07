import { redirect } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { bankingService } from '@/core/modules/banking';

import { identityService } from '@/core/modules/identity';

import { transactionsService } from '@/core/modules/transactions';

import { DomainException } from '@/core/shared/domain';

import { getQueryClient } from '@/app/_shared/lib/query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AuthManager } from '@/app/_shared/lib/session';

import { TransactionList } from '@/app/_widgets';

import { ConnectAccountCard } from '@/app/_features/plaid';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadTransactionsData = async () => {
  try {
    const queryClient = getQueryClient();
    const { userId } = await AuthManager.getSession();

    const [accounts, transactions, account] = await Promise.all([
      bankingService.getAccounts(userId),
      transactionsService.getTransactions(userId),
      identityService.getUserAccount(userId),
    ]);

    queryClient.setQueryData(queryKeys.featureFlags, account.features);

    return { queryClient, accounts, transactions };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function TransactionsPage() {
  const { queryClient, accounts, transactions } =
    await loadTransactionsData();

  const hasAccounts = accounts.length > 0;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <PageHeader
          title="Transactions"
          description="View and manage your transaction history."
        />

        {!hasAccounts && <ConnectAccountCard />}

        {hasAccounts && transactions.length > 0 && (
          <TransactionList transactions={transactions} />
        )}

        {hasAccounts && transactions.length === 0 && (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No transactions yet
              </p>

              <p className="text-xs text-muted-foreground/70">
                Sync your accounts to see transactions.
              </p>
            </div>
          </div>
        )}
      </PageContainer>
    </HydrationBoundary>
  );
}

export default TransactionsPage;
