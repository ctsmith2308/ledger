'use client';

import { RefreshCw } from 'lucide-react';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import { Button, Spinner } from '@/app/_components';

import { useSyncTransactions } from '../hooks';

function SyncTransactionsButton() {
  const { syncTransactions, isSyncing } = useSyncTransactions();
  const { isDisabled } = useFeatureFlags();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isSyncing || isDisabled(FEATURE_KEYS.PLAID_CONNECT)}
      onClick={() => syncTransactions()}
    >
      {isSyncing ? <Spinner /> : <RefreshCw className="size-3.5" />}
      Sync
    </Button>
  );
}

export { SyncTransactionsButton };
