'use client';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

const useFeatureFlags = () => {
  const queryClient = useQueryClient();

  const features =
    queryClient.getQueryData<string[]>(queryKeys.featureFlags) ?? [];

  const featureSet = new Set(features);

  return {
    isEnabled: (feature: string) => featureSet.has(feature),
    isDisabled: (feature: string) => !featureSet.has(feature),
  };
};

export { useFeatureFlags };
