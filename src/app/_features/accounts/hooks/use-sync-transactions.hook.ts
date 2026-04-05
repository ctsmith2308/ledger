import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { syncTransactionsAction } from '@/app/_entities/transactions/actions';

const useSyncTransactions = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => handleActionResponse(syncTransactionsAction()),
    onSuccess: () => {
      router.refresh();
    },
  });

  return { syncTransactions: mutate, isSyncing: isPending };
};

export { useSyncTransactions };
