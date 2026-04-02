'use client';

/** @deprecated Use useFeatureFlags() instead */
const useUserTier = () => {
  return { tier: null, isDemo: false };
};

export { useUserTier };
