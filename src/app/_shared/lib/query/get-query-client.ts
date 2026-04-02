import { cache } from 'react';

import { QueryClient } from '@tanstack/react-query';

import { queryDefaults } from './query-defaults';

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: queryDefaults,
    }),
);

export { getQueryClient };
