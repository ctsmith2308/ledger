'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { deleteBudgetAction } from '@/app/_entities/budgets/actions';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (budgetId: string) =>
      handleActionResponse(deleteBudgetAction({ budgetId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetOverview });
    },
  });

  return { deleteBudget: mutate, isDeleting: isPending };
};

export { useDeleteBudget };
