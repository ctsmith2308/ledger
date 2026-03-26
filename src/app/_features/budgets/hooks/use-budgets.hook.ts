import { useQuery } from '@tanstack/react-query';

import { getBudgetsAction } from '../actions';

const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => getBudgetsAction(),
  });
};

export { useBudgets };
