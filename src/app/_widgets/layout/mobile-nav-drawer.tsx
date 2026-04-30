'use client';

import { useState } from 'react';

import { Menu } from 'lucide-react';

import { Button, Dialog, DialogContent } from '@/app/_components';

import { NavSidebar } from './nav-sidebar';

function MobileNavDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5 text-muted-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="fixed inset-y-0 left-0 top-0 h-full w-72 max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-xl pt-4 sm:max-w-none"
          showCloseButton={false}
        >
          <NavSidebar onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export { MobileNavDrawer };
