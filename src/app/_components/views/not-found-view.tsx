import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/app/_components';
import { ROUTES } from '@/app/_shared/routes';

function NotFoundView() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <FileQuestion className="size-10 text-muted-foreground" />

        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h2>

        <p className="leading-7 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Button asChild>
          <Link href={ROUTES.home}>Go home</Link>
        </Button>
      </div>
    </div>
  );
}

export { NotFoundView };
