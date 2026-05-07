import { redirect, notFound } from 'next/navigation';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { transactionsService } from '@/core/modules/transactions';

import { DomainException } from '@/core/shared/domain';

import { ROUTES } from '@/app/_shared/routes';

import { AuthManager } from '@/app/_shared/lib/session';

import {
  parsePeriod,
  formatPeriod,
} from '@/app/_shared/lib/formatters/format-period';

import { mapSpendingDtoToCategory } from '@/app/_entities/transactions/lib';

import { SpendingDoughnut } from '@/app/_features/transactions';

import { TransactionList } from '@/app/_widgets';

import { PageContainer, PageHeader } from '@/app/_widgets';

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

const loadPeriodData = async (period: string) => {
  try {
    const { userId } = await AuthManager.getSession();

    const periodDate = parsePeriod(period);

    const [spending, allTransactions] = await Promise.all([
      transactionsService.getSpendingByCategory(userId, periodDate),
      transactionsService.getTransactions(userId),
    ]);

    const month = periodDate.getMonth();
    const year = periodDate.getFullYear();

    const transactions = allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    return { spending, transactions };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function SpendingPeriodPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;

  if (!PERIOD_PATTERN.test(period)) notFound();

  const { spending, transactions } = await loadPeriodData(period);
  const categoryData = mapSpendingDtoToCategory(spending);
  const title = formatPeriod(period);

  return (
    <PageContainer>
      <Link
        href={ROUTES.spendingHabits}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Monthly History
      </Link>

      <PageHeader
        title={title}
        description={`Spending breakdown for ${title}.`}
      />

      <SpendingDoughnut data={categoryData} />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>

        <TransactionList transactions={transactions} />
      </div>
    </PageContainer>
  );
}

export default SpendingPeriodPage;
