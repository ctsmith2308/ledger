import { loadAccounts } from '@/app/_entities/banking';
import { loadTransactions } from '@/app/_entities/transactions';

import { TransactionList } from '@/app/_features/transactions';
import { ConnectAccountCard } from '@/app/_features/plaid';

import { PageContainer, PageHeader } from '@/app/_widgets';

async function TransactionsPage() {
  const [accounts, transactions] = await Promise.all([
    loadAccounts(),
    loadTransactions(),
  ]);

  const hasAccounts = accounts.length > 0;

  return (
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
  );
}

export default TransactionsPage;
