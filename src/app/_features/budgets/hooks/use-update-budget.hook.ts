'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { updateBudgetAction } from '@/app/_entities/budgets/actions/update-budget.action';

import { type UpdateBudgetInput } from '@/app/_entities/budgets/schema/update-budget.schema';

import { queryKeys } from '@/app/_entities/shared/query-keys';

const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: UpdateBudgetInput) =>
      execute(updateBudgetAction(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetOverview });
    },
  });

  return { updateBudget: mutate, isUpdating: isPending };
};

export { useUpdateBudget };
