import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { budgetsService } from '@/core/modules/budgets';

import { getQueryClient } from '@/app/_shared/lib/query';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { BudgetList, CreateBudgetButton } from '@/app/_features/budgets';

import { PageContainer, PageHeader } from '@/app/_widgets';

import { BudgetDemoFootnote } from './_components/budget-demo-footnote';

const loadBudgetOverview = async () => {
  const session = await loadSession();

  return budgetsService.getBudgetOverview(session.userId, new Date());
};

async function BudgetsPage() {
  const overview = await loadBudgetOverview();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.budgetOverview, overview);

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
