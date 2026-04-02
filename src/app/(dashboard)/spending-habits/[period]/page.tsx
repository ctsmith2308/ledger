import { notFound } from 'next/navigation';

import { transactionsService } from '@/core/modules/transactions';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import {
  parsePeriod,
  formatPeriod,
} from '@/app/_shared/lib/formatters/format-period';

import { mapSpendingDtoToCategory } from '@/app/_entities/transactions/lib';

import { SpendingDoughnut } from '@/app/_features/transactions';

import { PageContainer, PageHeader } from '@/app/_widgets';

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

const loadPeriodData = async (period: string) => {
  const session = await loadSession();

  const spending = await transactionsService.getSpendingByCategory(
    session.userId,
    parsePeriod(period),
  );

  return { spending };
};

async function SpendingPeriodPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;

  if (!PERIOD_PATTERN.test(period)) notFound();

  const { spending } = await loadPeriodData(period);
  const categoryData = mapSpendingDtoToCategory(spending);
  const title = formatPeriod(period);

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={`Spending breakdown for ${title}.`}
      />

      <SpendingDoughnut data={categoryData} />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>

        <p className="text-sm text-muted-foreground">
          Transaction list coming soon.
        </p>
      </div>
    </PageContainer>
  );
}

export default SpendingPeriodPage;
