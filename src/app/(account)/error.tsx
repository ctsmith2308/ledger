'use client';

import { ErrorView } from '@/app/_widgets';

export default function AccountError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView reset={reset} />;
}
