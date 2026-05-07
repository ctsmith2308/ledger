import { redirect } from 'next/navigation';

import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { identityService } from '@/core/modules/identity';

import { DomainException } from '@/core/shared/domain';

import { ROUTES } from '@/app/_shared/routes';

import { getQueryClient } from '@/app/_shared/lib/query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AuthManager } from '@/app/_shared/lib/session';

import {
  UpdateProfileForm,
  DeleteAccountCard,
  MfaSettingsCard,
} from '@/app/_features/user-account';

import { LogoutButton } from '@/app/_features/auth';

const loadSettingsData = async () => {
  try {
    const queryClient = getQueryClient();
    const { userId } = await AuthManager.getSession();

    const account = await identityService.getUserAccount(userId);

    queryClient.setQueryData(queryKeys.userAccount, account);

    queryClient.setQueryData(queryKeys.featureFlags, account.features);

    return { queryClient, account };
  } catch (error) {
    if (error instanceof DomainException) redirect('/login');

    throw error;
  }
};

export default async function SettingsPage() {
  const { queryClient, account } = await loadSettingsData();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10">
        <Link
          href={ROUTES.overview}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Overview
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage your profile and account settings.
          </p>
        </div>

        <div className="space-y-6">
          <UpdateProfileForm
            initial={{
              firstName: account.firstName,
              lastName: account.lastName,
            }}
          />

          <MfaSettingsCard mfaEnabled={account.mfaEnabled} />

          <div className="rounded-xl border border-border bg-card p-4">
            <LogoutButton />
          </div>

          <DeleteAccountCard />
        </div>
      </div>
    </HydrationBoundary>
  );
}
