import { bankingService } from '@/core/modules/banking';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import { calcTotalsByType } from '@/app/_entities/banking/lib';

import { ConnectAccountCard } from '@/app/_features/plaid';

import {
  AccountGroupList,
  ConnectionList,
  SyncTransactionsButton,
} from '@/app/_features/accounts';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadAccountsData = async () => {
  const session = await loadSession();

  const [accounts, connections] = await Promise.all([
    bankingService.getAccounts(session.userId),
    bankingService.getConnections(session.userId),
  ]);

  return { accounts, connections };
};

async function AccountsPage() {
  const { accounts, connections } = await loadAccountsData();
  const totals = calcTotalsByType(accounts);
  const hasAccounts = accounts.length > 0;

  return (
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
  );
}

export default AccountsPage;
