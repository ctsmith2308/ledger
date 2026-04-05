import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { unlinkBankAction } from '@/app/_entities/banking/actions';

const useUnlinkBank = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (plaidItemId: string) =>
      handleActionResponse(unlinkBankAction({ plaidItemId })),
    onSuccess: () => {
      router.refresh();
    },
  });

  return { unlinkBank: mutate, isUnlinking: isPending };
};

export { useUnlinkBank };
