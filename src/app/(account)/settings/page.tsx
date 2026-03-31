import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { identityController } from '@/core/modules/identity';

import { ROUTES } from '@/app/_lib/config';

import { loadSession } from '@/app/_entities/identity/loaders';

import {
  UpdateProfileForm,
  DeleteAccountCard,
} from '@/app/_features/user-account';

import { LogoutButton } from '@/app/_features/auth';

const loadSettingsData = async () => {
  const session = await loadSession();

  const profile = await identityController.getUserProfile(session.userId);

  return profile;
};

export default async function SettingsPage() {
  const profile = await loadSettingsData();

  return (
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
            firstName: profile.firstName,
            lastName: profile.lastName,
          }}
        />

        <div className="rounded-xl border border-border bg-card p-4">
          <LogoutButton />
        </div>

        <DeleteAccountCard />
      </div>
    </div>
  );
}
