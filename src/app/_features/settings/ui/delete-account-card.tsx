'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/app/_components';

import { useDeleteAccount } from '../hooks';

function DeleteAccountCard() {
  const { deleteAccount, isDeleting } = useDeleteAccount();

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400">
          Danger zone
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Permanently delete your account and all associated data. This
          action cannot be undone.
        </p>
      </CardContent>

      <CardFooter>
        <Button
          variant="destructive"
          disabled={isDeleting}
          onClick={() => {
            if (window.confirm('Are you sure? This cannot be undone.')) {
              deleteAccount();
            }
          }}
        >
          {isDeleting && <Spinner />}
          Delete account
        </Button>
      </CardFooter>
    </Card>
  );
}

export { DeleteAccountCard };
