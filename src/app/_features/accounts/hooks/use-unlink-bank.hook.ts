import { useMutation, useQueryClient } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { unlinkBankAction } from '@/app/_entities/banking/actions';

const useUnlinkBank = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (plaidItemId: string) =>
      handleActionResponse(unlinkBankAction({ plaidItemId })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  return { unlinkBank: mutate, isUnlinking: isPending };
};

export { useUnlinkBank };
