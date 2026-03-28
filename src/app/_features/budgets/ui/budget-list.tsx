'use client';

import { Trash2 } from 'lucide-react';

import { type BudgetDTO } from '@/core/modules/budgets';

import {
  Button,
  List,
  ListHeader,
  ListTitle,
  ListContent,
  ListItem,
} from '@/app/_components';

import { useDeleteBudget } from '../hooks';

function BudgetList({ budgets }: { budgets: BudgetDTO[] }) {
  const { deleteBudget, isDeleting } = useDeleteBudget();

  return (
    <List>
      <ListHeader>
        <ListTitle>Your Budgets</ListTitle>
      </ListHeader>

      <ListContent>
        {budgets.map((budget) => (
          <ListItem key={budget.id} className="py-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {budget.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                ${budget.monthlyLimit.toFixed(2)}/mo
              </span>

              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                onClick={() => deleteBudget(budget.id)}
                aria-label={`Delete ${budget.category} budget`}
              >
                <Trash2 className="size-4 text-muted-foreground hover:text-red-500" />
              </Button>
            </div>
          </ListItem>
        ))}
      </ListContent>
    </List>
  );
}

export { BudgetList };
