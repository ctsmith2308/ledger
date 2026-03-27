'use client';

import { Building2 } from 'lucide-react';

import { Button, Spinner } from '@/app/_components';

import { usePlaidLinkFlow } from '../hooks';

function ConnectAccountCard() {
  const { connect, open, isPending, isReady } = usePlaidLinkFlow();

  return (
    <div className="mb-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Building2 className="size-8 text-zinc-400" />

        <h3 className="text-sm font-semibold text-zinc-900">
          Connect your bank account
        </h3>

        <p className="max-w-sm text-xs text-zinc-500">
          Link your bank account to automatically import transactions and track
          your spending.
        </p>

        <Button
          onClick={isReady ? () => open() : connect}
          disabled={isPending}
          className="mt-2"
        >
          {isPending && <Spinner />}
          {isReady ? 'Open Plaid Link' : 'Connect Account'}
        </Button>
      </div>
    </div>
  );
}

export { ConnectAccountCard };
