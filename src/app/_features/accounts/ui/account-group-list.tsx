import { type BankAccountDTO } from '@/core/modules/banking';

import { type AccountTypeTotal } from '@/app/_entities/banking/lib';

import {
  List,
  ListHeader,
  ListContent,
  ListItem,
} from '@/app/_components';

const _groupByType = (accounts: BankAccountDTO[]) => {
  const groups = new Map<string, BankAccountDTO[]>();

  for (const acct of accounts) {
    const type = acct.type.charAt(0).toUpperCase() + acct.type.slice(1);
    const existing = groups.get(type) ?? [];
    groups.set(type, [...existing, acct]);
  }

  return groups;
};

function AccountGroupList({
  accounts,
  totals,
}: {
  accounts: BankAccountDTO[];
  totals: AccountTypeTotal[];
}) {
  const grouped = _groupByType(accounts);
  const totalsByType = new Map(totals.map((t) => [t.type, t]));

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([type, accts]) => {
        const typeTotal = totalsByType.get(type);

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
  );
}

export { AccountGroupList };
