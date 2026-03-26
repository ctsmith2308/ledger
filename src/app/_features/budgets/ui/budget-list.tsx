import { type BudgetDTO } from '@/core/modules/budgets';

function BudgetList({ budgets }: { budgets: BudgetDTO[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Your Budgets</h2>
      </div>

      <ul className="divide-y divide-zinc-100">
        {budgets.map((budget) => (
          <li
            key={budget.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">
                {budget.category}
              </span>
            </div>
            <span className="text-sm font-semibold text-zinc-900">
              ${budget.monthlyLimit.toFixed(2)}/mo
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { BudgetList };
