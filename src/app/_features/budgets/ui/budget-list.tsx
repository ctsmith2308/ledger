'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, Pencil, Trash2 } from 'lucide-react';

import { type BudgetOverviewItemDTO } from '@/core/modules/budgets';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { ROUTES } from '@/app/_shared/routes';

import { formatCategory } from '@/app/_shared/lib/formatters/format-category';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import { useBudgetOverview } from '@/app/_entities/budgets/hooks/use-budget-overview.hook';

import { TransactionList } from '@/app/_widgets';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Input,
  Spinner,
} from '@/app/_components';

import { useDeleteBudget, useUpdateBudget } from '../hooks';

function BudgetList() {
  const { data: overview } = useBudgetOverview();
  const { isDisabled } = useFeatureFlags();

  if (!overview) return null;

  if (overview.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card transition-colors">
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No budgets yet
          </p>

          <p className="text-xs text-muted-foreground/70">
            Create your first budget to start tracking.
          </p>
        </div>
      </div>
    );
  }

  const budgetWriteDisabled = isDisabled(FEATURE_KEYS.BUDGET_WRITE);

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {overview.map((item) => (
        <BudgetRow key={item.id} item={item} isDemo={budgetWriteDisabled} />
      ))}
    </Accordion>
  );
}

function BudgetRow({
  item,
  isDemo,
}: {
  item: BudgetOverviewItemDTO;
  isDemo: boolean;
}) {
  const { deleteBudget, isDeleting } = useDeleteBudget();
  const { updateBudget, isUpdating } = useUpdateBudget();

  const remaining = item.monthlyLimit - item.spent;

  return (
    <AccordionItem
      value={item.id}
      className="rounded-xl border border-border bg-card px-4 last:border-b"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="text-sm font-medium text-foreground">
            {formatCategory(item.category)}
          </span>

          <span className="hidden text-xs text-muted-foreground sm:inline">
            ·
          </span>

          <span className="text-xs">
            <span className="font-semibold text-foreground">
              $
              {remaining >= 0
                ? remaining.toFixed(2)
                : Math.abs(remaining).toFixed(2)}
            </span>{' '}
            <span
              className={`font-medium ${remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {remaining >= 0 ? 'under budget' : 'over budget'}
            </span>
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Recent Transactions
              </span>

              <Link
                href={ROUTES.transactions}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <TransactionList
              transactions={item.transactions}
              paginate={false}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Spent</span>

              <span className="font-semibold text-foreground">
                ${item.spent.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">
                Allocated
              </span>

              <span className="font-semibold text-foreground">
                ${item.monthlyLimit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EditBudgetDialog
              budgetId={item.id}
              category={item.category}
              currentLimit={item.monthlyLimit}
              isDemo={isDemo}
              isUpdating={isUpdating}
              onSave={updateBudget}
            />

            <Button
              variant="ghost"
              size="sm"
              disabled={isDemo || isDeleting}
              onClick={() => deleteBudget(item.id)}
            >
              <Trash2 className="size-3 text-muted-foreground hover:text-red-500" />
              Delete
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function EditBudgetDialog({
  budgetId,
  category,
  currentLimit,
  isDemo,
  isUpdating,
  onSave,
}: {
  budgetId: string;
  category: string;
  currentLimit: number;
  isDemo: boolean;
  isUpdating: boolean;
  onSave: (input: { budgetId: string; monthlyLimit: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editLimit, setEditLimit] = useState('');

  const handleSave = () => {
    const value = Number(editLimit);

    if (value > 0) {
      onSave({ budgetId, monthlyLimit: value });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isDemo || isUpdating}
          />
        }
      >
        <Pencil className="size-3" />
        Edit
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {formatCategory(category)} budget</DialogTitle>

          <DialogDescription>
            Update the monthly spending limit.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="number"
          step="0.01"
          placeholder={currentLimit.toFixed(2)}
          value={editLimit}
          onChange={(e) => setEditLimit(e.target.value)}
        />

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>

          <Button disabled={isUpdating} onClick={handleSave}>
            {isUpdating && <Spinner />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { BudgetList };
