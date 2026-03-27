'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { deleteBudgetAction } from '@/app/_entities/budgets';

const useDeleteBudget = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (budgetId: string) =>
      execute(deleteBudgetAction({ budgetId })),
    onSuccess: () => {
      router.refresh();
    },
  });

  return { deleteBudget: mutate, isDeleting: isPending };
};

export { useDeleteBudget };
