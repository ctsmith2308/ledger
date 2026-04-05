'use client';

import { useState } from 'react';

import { Unlink } from 'lucide-react';

import { type BankAccountDTO, type PlaidItemDTO } from '@/core/modules/banking';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  List,
  ListContent,
  ListHeader,
  ListItem,
  Spinner,
} from '@/app/_components';

import { useUnlinkBank } from '../hooks';

function ConnectionList({
  connections,
  accounts,
}: {
  connections: PlaidItemDTO[];
  accounts: BankAccountDTO[];
}) {
  const accountsByItem = new Map<string, BankAccountDTO[]>();

  for (const account of accounts) {
    const existing = accountsByItem.get(account.plaidItemId) ?? [];
    accountsByItem.set(account.plaidItemId, [...existing, account]);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Connections</h2>

      <div className="flex flex-col gap-3">
        {connections.map((connection) => (
          <ConnectionItem
            key={connection.id}
            connection={connection}
            accounts={accountsByItem.get(connection.id) ?? []}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectionItem({
  connection,
  accounts,
}: {
  connection: PlaidItemDTO;
  accounts: BankAccountDTO[];
}) {
  const [open, setOpen] = useState(false);
  const { unlinkBank, isUnlinking } = useUnlinkBank();
  const { isDisabled } = useFeatureFlags();

  const handleUnlink = () => {
    unlinkBank(connection.id, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <List>
      <ListHeader className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {connection.institutionId ?? 'Bank Connection'}
        </span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={isDisabled(FEATURE_KEYS.PLAID_CONNECT)}
              />
            }
          >
            <Unlink className="size-3.5" />
            Unlink
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlink bank connection?</DialogTitle>

              <DialogDescription>
                This will remove the connection and all associated accounts and
                transactions. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isUnlinking}
                onClick={handleUnlink}
              >
                {isUnlinking && <Spinner />}
                Unlink
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ListHeader>

      <ListContent>
        {accounts.map((account) => (
          <ListItem key={account.id}>
            <span className="text-sm text-foreground">
              {account.officialName ?? account.name}
            </span>

            <span className="text-xs text-muted-foreground">
              {account.mask ? `••${account.mask}` : account.type}
            </span>
          </ListItem>
        ))}
      </ListContent>
    </List>
  );
}

export { ConnectionList };
