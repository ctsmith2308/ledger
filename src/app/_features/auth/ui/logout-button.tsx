'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/app/_components';

import { useLogout } from '../hooks';

function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => logout()}
      className="w-full justify-start gap-3 text-muted-foreground"
    >
      <LogOut className="size-4" />
      Log out
    </Button>
  );
}

export { LogoutButton };
