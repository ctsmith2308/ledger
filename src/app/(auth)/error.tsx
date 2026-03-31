'use client';

import { ErrorView } from '@/app/_components';

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView reset={reset} />;
}
