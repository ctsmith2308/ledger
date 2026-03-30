import { type JwtData, UnauthorizedException } from '@/core/shared/domain';
import { bankingController } from '@/core/modules/banking';

import { getQueryClient } from '@/app/_lib/query';

import { queryKeys } from '@/app/_entities/shared';
import { calcTotalsByType } from '@/app/_entities/banking';

import { ConnectAccountCard } from '@/app/_features/plaid';
import { AccountGroupList } from '@/app/_features/accounts';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadAccountsData = async () => {
  const queryClient = getQueryClient();
  const session = queryClient.getQueryData<JwtData>(queryKeys.session);
  if (!session) throw new UnauthorizedException();

  const accounts = await bankingController.getAccounts(session.userId);

  queryClient.setQueryData(queryKeys.accounts, accounts);

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
