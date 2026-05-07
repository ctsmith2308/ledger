import { redirect } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { budgetsService } from '@/core/modules/budgets';

import { identityService } from '@/core/modules/identity';

import { DomainException } from '@/core/shared/domain';

import { getQueryClient } from '@/app/_shared/lib/query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AuthManager } from '@/app/_shared/lib/session';

import { BudgetList, CreateBudgetButton } from '@/app/_features/budgets';

import { PageContainer, PageHeader } from '@/app/_widgets';

import { BudgetDemoFootnote } from './_components/budget-demo-footnote';

const loadBudgetData = async () => {
  try {
    const queryClient = getQueryClient();
    const { userId } = await AuthManager.getSession();

    const [overview, account] = await Promise.all([
      budgetsService.getBudgetOverview(userId, new Date()),
      identityService.getUserAccount(userId),
    ]);

    queryClient.setQueryData(queryKeys.budgetOverview, overview);

    queryClient.setQueryData(queryKeys.featureFlags, account.features);

    return { queryClient, overview };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

async function BudgetsPage() {
  const { queryClient } = await loadBudgetData();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer>
        <PageHeader
          title="Budgets"
          description="Set monthly spending limits by category."
        >
          <CreateBudgetButton />
        </PageHeader>

        <BudgetDemoFootnote />

        <BudgetList />
      </PageContainer>
    </HydrationBoundary>
  );
}

export default BudgetsPage;
