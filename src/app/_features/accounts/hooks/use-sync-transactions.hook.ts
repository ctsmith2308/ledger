import { useMutation, useQueryClient } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { syncTransactionsAction } from '@/app/_entities/transactions/actions';

const useSyncTransactions = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => handleActionResponse(syncTransactionsAction()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  return { syncTransactions: mutate, isSyncing: isPending };
};

export { useSyncTransactions };
