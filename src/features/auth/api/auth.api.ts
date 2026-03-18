import { trpcClient } from '@/lib/trpc';

const authApi = {
  register: (data: { email: string; password: string }) =>
    trpcClient.identity.register.mutate(data),
};

export { authApi };
