import { bankingController } from '@/core/modules/banking';

import { transactionsController } from '@/core/modules/transactions';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import { TransactionList } from '@/app/_features/transactions';

import { ConnectAccountCard } from '@/app/_features/plaid';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadTransactionsData = async () => {
  const session = await loadSession();

  const [accounts, transactions] = await Promise.all([
    bankingController.getAccounts(session.userId),
    transactionsController.getTransactions(session.userId),
  ]);

  return { accounts, transactions };
};

async function TransactionsPage() {
  const { accounts, transactions } = await loadTransactionsData();

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
