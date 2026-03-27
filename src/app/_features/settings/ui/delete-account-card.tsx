'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="destructive" disabled={isDeleting} />
            }
          >
            {isDeleting && <Spinner />}
            Delete account
          </DialogTrigger>

          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This will permanently delete your account, sessions,
                profile, and all associated data. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => deleteAccount()}
              >
                {isDeleting && <Spinner />}
                Yes, delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

export { DeleteAccountCard };
