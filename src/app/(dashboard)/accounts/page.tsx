import { execute } from '@/app/_lib/safe-action';

import { type BankAccountDTO } from '@/core/modules/banking';

import { getAccountsAction, calcTotalsByType } from '@/app/_entities/banking';

import { ConnectAccountCard } from '@/app/_features/plaid';

import {
  PageContainer,
  PageHeader,
} from '@/app/_widgets';

import {
  List,
  ListHeader,
  ListContent,
  ListItem,
} from '@/app/_components';

const LIABILITY_TYPES = ['credit', 'loan'];

const _groupByType = (accounts: BankAccountDTO[]) => {
  const groups = new Map<string, BankAccountDTO[]>();

  for (const acct of accounts) {
    const type = acct.type.charAt(0).toUpperCase() + acct.type.slice(1);
    const existing = groups.get(type) ?? [];
    groups.set(type, [...existing, acct]);
  }

  return groups;
};

async function AccountsPage() {
  const accounts = await execute(getAccountsAction());
  const grouped = _groupByType(accounts);
  const totals = calcTotalsByType(accounts);

  const totalsByType = new Map(totals.map((t) => [t.type, t]));

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description="Manage your linked bank accounts."
      />

      <ConnectAccountCard />

      {accounts.length > 0 && (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([type, accts]) => {
            const typeTotal = totalsByType.get(type);
            const isLiability = LIABILITY_TYPES.includes(type.toLowerCase());

            return (
              <List key={type}>
                <ListHeader className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {type}
                  </span>

                  {typeTotal && (
                    <span
                      className={`text-sm font-semibold ${typeTotal.isLiability ? 'text-red-600' : 'text-green-600'}`}
                    >
                      ${typeTotal.total.toFixed(2)}
                    </span>
                  )}
                </ListHeader>

                <ListContent>
                  {accts.map((acct) => {
                    const balance = acct.currentBalance ?? 0;

                    return (
                      <ListItem key={acct.id}>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {acct.officialName ?? acct.name}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {acct.subtype ?? acct.type}
                            {acct.mask ? ` · ••${acct.mask}` : ''}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-foreground">
                          ${balance.toFixed(2)}
                        </span>
                      </ListItem>
                    );
                  })}
                </ListContent>
              </List>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

export default AccountsPage;
