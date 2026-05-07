import { redirect } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { bankingService } from '@/core/modules/banking';

import { identityService } from '@/core/modules/identity';

import { DomainException } from '@/core/shared/domain';

import { getQueryClient } from '@/app/_shared/lib/query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AuthManager } from '@/app/_shared/lib/session';

import { calcTotalsByType } from '@/app/_entities/banking/lib';

import { ConnectAccountCard } from '@/app/_features/plaid';

import {
  AccountGroupList,
  ConnectionList,
  SyncTransactionsButton,
} from '@/app/_features/accounts';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadAccountsData = async () => {
  try {
    const queryClient = getQueryClient();
    const { userId } = await AuthManager.getSession();

    const [accounts, connections, account] = await Promise.all([
      bankingService.getAccounts(userId),
      bankingService.getConnections(userId),
      identityService.getUserAccount(userId),
    ]);

    queryClient.setQueryData(queryKeys.featureFlags, account.features);

    return { queryClient, accounts, connections };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function AccountsPage() {
  const { queryClient, accounts, connections } = await loadAccountsData();

  const totals = calcTotalsByType(accounts);
  const hasAccounts = accounts.length > 0;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <PageHeader
          title="Accounts"
          description="Manage your linked financial accounts."
        >
          {hasAccounts && <SyncTransactionsButton />}
        </PageHeader>

        <ConnectAccountCard />

        {connections.length > 0 && (
          <ConnectionList connections={connections} accounts={accounts} />
        )}

        {hasAccounts && (
          <AccountGroupList accounts={accounts} totals={totals} />
        )}
      </PageContainer>
    </HydrationBoundary>
  );
}

export default AccountsPage;
