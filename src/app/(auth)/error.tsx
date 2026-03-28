'use client';

import { ErrorView } from '@/app/_widgets';

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView reset={reset} />;
}
