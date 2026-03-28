import Link from 'next/link';

import { ROUTES } from '@/app/_lib/config';

import { RegisterForm } from '@/app/_features/auth';

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}

        <Link
          href={ROUTES.login}
          className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-600"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
