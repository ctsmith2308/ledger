'use client';

// TODO: Replace with useFeatureFlag when feature_flags table lands
const useUserTier = () => {
  return { tier: null, isDemo: false };
};

export { useUserTier };
