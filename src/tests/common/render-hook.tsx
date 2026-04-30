import { type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { renderHook, type RenderHookOptions } from '@testing-library/react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { Wrapper, queryClient };
};

const renderHookWithProviders = <TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>,
) => {
  const { Wrapper, queryClient } = createWrapper();

  const rendered = renderHook(hook, { wrapper: Wrapper, ...options });

  return { ...rendered, queryClient };
};

export { renderHookWithProviders, createTestQueryClient, createWrapper };
