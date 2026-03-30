import { loadBudgets } from '@/app/_entities/budgets';

import { BudgetList, CreateBudgetButton } from '@/app/_features/budgets';

import { PageContainer, PageHeader } from '@/app/_widgets';

async function BudgetsPage() {
  const budgets = await loadBudgets();

  return (
    <PageContainer>
      <PageHeader
        title="Budgets"
        description="Set monthly spending limits by category."
      >
        <CreateBudgetButton />
      </PageHeader>

      {budgets.length > 0 ? (
        <BudgetList budgets={budgets} />
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
  );
}

export default BudgetsPage;
