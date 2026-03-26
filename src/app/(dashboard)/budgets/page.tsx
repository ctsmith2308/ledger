import { execute } from '@/app/_lib/safe-action';

import { getBudgetsAction } from '@/app/_entities/budgets';

import { BudgetList, CreateBudgetForm } from '@/app/_features/budgets';

async function BudgetsPage() {
  const budgets = await execute(getBudgetsAction());

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Budgets</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Set monthly spending limits by category.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {budgets.length > 0 ? (
            <BudgetList budgets={budgets} />
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-sm font-medium text-zinc-500">
                  No budgets yet
                </p>
                <p className="text-xs text-zinc-400">
                  Create your first budget to start tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <CreateBudgetForm />
        </div>
      </div>
    </main>
  );
}

export default BudgetsPage;
