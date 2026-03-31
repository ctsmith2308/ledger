'use client';

import { useQuery } from '@tanstack/react-query';

import { type BudgetOverviewItemDTO } from '@/core/modules/budgets';

import { ActionError } from '@/app/_shared/lib/next-safe-action';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

const useBudgetOverview = () => {
  return useQuery<BudgetOverviewItemDTO[]>({
    queryKey: queryKeys.budgetOverview,
    queryFn: async () => {
      const res = await fetch('/api/budgets/overview');

      if (!res.ok) {
        const body = await res.json();
        throw new ActionError(body.code, body.message);
      }

      return res.json();
    },
  });
};

export { useBudgetOverview };
