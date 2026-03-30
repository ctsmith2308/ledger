import { loadAccounts, calcTotalsByType } from '@/app/_entities/banking';

import { ConnectAccountCard } from '@/app/_features/plaid';
import { AccountGroupList } from '@/app/_features/accounts';

import { PageContainer, PageHeader } from '@/app/_widgets';

async function AccountsPage() {
  const accounts = await loadAccounts();
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
