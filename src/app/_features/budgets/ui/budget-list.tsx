'use client';

import { Trash2 } from 'lucide-react';

import { type BudgetDTO } from '@/core/modules/budgets';

import { Button } from '@/app/_components';

import { useDeleteBudget } from '../hooks';

function BudgetList({ budgets }: { budgets: BudgetDTO[] }) {
  const { deleteBudget, isDeleting } = useDeleteBudget();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Your Budgets
        </h2>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {budgets.map((budget) => (
          <li
            key={budget.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {budget.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                ${budget.monthlyLimit.toFixed(2)}/mo
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                onClick={() => deleteBudget(budget.id)}
                aria-label={`Delete ${budget.category} budget`}
              >
                <Trash2 className="size-4 text-zinc-400 hover:text-red-500" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { BudgetList };
