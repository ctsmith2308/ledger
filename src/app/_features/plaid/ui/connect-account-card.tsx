'use client';

import { Building2 } from 'lucide-react';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import { DemoFootnote } from '@/app/_widgets';

import { Button, Spinner } from '@/app/_components';

import { usePlaidLinkFlow } from '../hooks';

function ConnectAccountCard() {
  const { connect, open, isPending, isReady } = usePlaidLinkFlow();
  const { isDisabled } = useFeatureFlags();
  const plaidDisabled = isDisabled(FEATURE_KEYS.PLAID_CONNECT);

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted px-5 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Building2 className="size-8 text-muted-foreground" />

        <h3 className="text-sm font-semibold text-foreground">
          Connect your to your financial institution.
        </h3>

        <p className="max-w-sm text-xs text-muted-foreground">
          Link your account to automatically import transactions, savings,
          investments and track your spending.
        </p>

        <Button
          onClick={isReady ? () => open() : connect}
          disabled={isPending || plaidDisabled}
        >
          {isPending && <Spinner />}

          {isReady ? 'Open Plaid Link' : 'Connect Account'}
        </Button>

        <DemoFootnote action="Linking additional accounts" disabled={plaidDisabled} />
      </div>
    </div>
  );
}

export { ConnectAccountCard };
