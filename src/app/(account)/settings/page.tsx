import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/app/_lib/config';

import { loadProfile } from '@/app/_entities/identity';

import {
  UpdateProfileForm,
  DeleteAccountCard,
} from '@/app/_features/user-account';
import { LogoutButton } from '@/app/_features/auth';

export default async function SettingsPage() {
  const profile = await loadProfile();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={ROUTES.overview}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Overview
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
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
