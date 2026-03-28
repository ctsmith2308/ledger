import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/app/_components';
import { ROUTES } from '@/app/_lib/config';

function NotFoundView() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <FileQuestion className="mx-auto size-10 text-muted-foreground" />

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h2>

        <p className="mt-2 leading-7 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Button asChild className="mt-6">
          <Link href={ROUTES.home}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}

export { NotFoundView };
