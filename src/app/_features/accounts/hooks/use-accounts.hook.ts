import { useQuery } from '@tanstack/react-query';

import { getAccountsAction } from '../actions';

const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccountsAction(),
  });
};

export { useAccounts };
