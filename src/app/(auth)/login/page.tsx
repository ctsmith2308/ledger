import Link from 'next/link';

import { ROUTES } from '@/app/_shared/routes';

import { LoginForm } from '@/app/_features/auth';

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <LoginForm />

      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}

        <Link
          href={ROUTES.register}
          className="font-medium text-foreground underline underline-offset-4 hover:text-emerald-600"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
