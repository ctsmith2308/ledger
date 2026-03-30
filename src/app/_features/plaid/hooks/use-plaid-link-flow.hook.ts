import { useState, useCallback, useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';

import { usePlaidLink } from 'react-plaid-link';

import { execute } from '@/app/_lib/safe-action';

import {
  createLinkTokenAction,
  exchangePublicTokenAction,
} from '@/app/_entities/banking/actions';

import { type ExchangePublicTokenInput } from '@/app/_entities/banking/schema';

import { syncTransactionsAction } from '@/app/_entities/transactions/actions';

const usePlaidLinkFlow = () => {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const createToken = useMutation({
    mutationFn: () => execute(createLinkTokenAction()),
    onSuccess: (data) => {
      setLinkToken(data.linkToken);
    },
  });

  const exchangeToken = useMutation({
    mutationFn: (input: ExchangePublicTokenInput) =>
      execute(exchangePublicTokenAction(input)),
    onSuccess: async () => {
      await execute(syncTransactionsAction());
      router.refresh();
    },
  });

  const onPlaidSuccess = useCallback(
    (publicToken: string) => {
      exchangeToken.mutate({ publicToken });
    },
    [exchangeToken],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const connect = useCallback(() => {
    createToken.mutate();
  }, [createToken]);

  const isPending = createToken.isPending || exchangeToken.isPending;
  const isReady = linkToken !== null && ready;

  return { connect, open, isPending, isReady };
};

export { usePlaidLinkFlow };
