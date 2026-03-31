import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { budgetsController } from '@/core/modules/budgets';

import { getQueryClient } from '@/app/_lib/query';

import { loadSession } from '@/app/_entities/identity/loaders';

import { queryKeys } from '@/app/_entities/shared/query-keys';

import { BudgetList, CreateBudgetButton } from '@/app/_features/budgets';

import { PageContainer, PageHeader, DemoFootnote } from '@/app/_widgets';

const loadBudgetOverview = async () => {
  const session = await loadSession();

  return budgetsController.getBudgetOverview(session.userId, new Date());
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
        <DemoFootnote action="Budget management" />

        {overview.length > 0 ? (
          <BudgetList />
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No budgets yet
              </p>

              <p className="text-xs text-muted-foreground/70">
                Create your first budget to start tracking.
              </p>
            </div>
          </div>
        )}
      </PageContainer>
    </HydrationBoundary>
  );
}

export default BudgetsPage;
