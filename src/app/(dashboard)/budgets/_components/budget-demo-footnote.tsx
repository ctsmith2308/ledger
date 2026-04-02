'use client';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import { DemoFootnote } from '@/app/_widgets';

function BudgetDemoFootnote() {
  const { isDisabled } = useFeatureFlags();

  return (
    <DemoFootnote
      action="Budget management"
      disabled={isDisabled(FEATURE_KEYS.BUDGET_WRITE)}
    />
  );
}

export { BudgetDemoFootnote };
