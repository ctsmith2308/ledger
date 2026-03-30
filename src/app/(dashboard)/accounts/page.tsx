import { bankingController } from '@/core/modules/banking';

import { loadSession } from '@/app/_entities/identity/loaders';

import { calcTotalsByType } from '@/app/_entities/banking/lib';

import { ConnectAccountCard } from '@/app/_features/plaid';

import { AccountGroupList } from '@/app/_features/accounts';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadAccountsData = async () => {
  const session = await loadSession();

  const accounts = await bankingController.getAccounts(session.userId);

  return accounts;
};

async function AccountsPage() {
  const accounts = await loadAccountsData();
  const totals = calcTotalsByType(accounts);

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description="Manage your linked bank accounts."
      />

      <ConnectAccountCard />

      {accounts.length > 0 && (
        <AccountGroupList accounts={accounts} totals={totals} />
      )}
    </PageContainer>
  );
}

export default AccountsPage;
