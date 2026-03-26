import { useQuery } from '@tanstack/react-query';

import { getTransactionsAction } from '../actions';

const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactionsAction(),
  });
};

export { useTransactions };
