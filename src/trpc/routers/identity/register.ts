import { registerUserValidator } from '@/core/modules/indentity/application/schema';
import { identityModule } from '@/core/modules/indentity/identity.module';
import { publicProcedure } from '@/trpc/init';

const register = publicProcedure
  .input(registerUserValidator)
  .mutation(async ({ input }) => {
    const result = await identityModule.registerUser.execute(input);
    return result.getValueOrThrow();
  });

export { register };
