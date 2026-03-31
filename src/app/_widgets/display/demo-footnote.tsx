'use client';

import { Info } from 'lucide-react';

import { useUserTier } from '@/app/_entities/identity/hooks';

function DemoFootnote({ action }: { action: string }) {
  const { isDemo } = useUserTier();

  if (!isDemo) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3 shrink-0" />

      <p>
        {action} is disabled for demo users. Create your own account
        for full access.
      </p>
    </div>
  );
}

export { DemoFootnote };
