import { redirect } from 'next/navigation';

import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { transactionsService } from '@/core/modules/transactions';

import { DomainException } from '@/core/shared/domain';

import { ROUTES } from '@/app/_shared/routes';

import { AuthManager } from '@/app/_shared/lib/session';

import { formatPeriod } from '@/app/_shared/lib/formatters/format-period';

import { mapSpendingDtoToCategory } from '@/app/_entities/transactions/lib';

import { SpendingDoughnut } from '@/app/_features/transactions';

import { PageContainer, PageHeader } from '@/app/_widgets';

const loadSpendingData = async () => {
  try {
    const { userId } = await AuthManager.getSession();

    const [spendingPeriods, currentMonthSpending] = await Promise.all([
      transactionsService.getSpendingPeriods(userId),
      transactionsService.getSpendingByCategory(userId, new Date()),
    ]);

    return { spendingPeriods, currentMonthSpending };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function SpendingHabitsPage() {
  const { spendingPeriods, currentMonthSpending } = await loadSpendingData();

  const { periods } = spendingPeriods;
  const categoryData = mapSpendingDtoToCategory(currentMonthSpending);

  return (
    <PageContainer>
      <PageHeader
        title="Spending Habits"
        description="Monthly spending breakdowns by category."
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">This Month</h2>

        <SpendingDoughnut data={categoryData} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Monthly History
        </h2>

        {periods.length > 0 ? (
          <div className="flex flex-col gap-1">
            {periods.map((period) => (
              <Link
                key={period}
                href={`${ROUTES.spendingHabits}/${period}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium text-foreground">
                  {formatPeriod(period)}
                </span>

                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No spending data yet.
          </p>
        )}
      </div>
    </PageContainer>
  );
}

export default SpendingHabitsPage;
