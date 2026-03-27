import { execute } from '@/app/_lib/safe-action';

import { getUserProfileAction } from '@/app/_entities/identity';

import { UpdateProfileForm, DeleteAccountCard } from '@/app/_features/settings';

export default async function SettingsPage() {
  const profile = await execute(getUserProfileAction());

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <UpdateProfileForm
          initial={{
            firstName: profile.firstName,
            lastName: profile.lastName,
          }}
        />

        <DeleteAccountCard />
      </div>
    </div>
  );
}
