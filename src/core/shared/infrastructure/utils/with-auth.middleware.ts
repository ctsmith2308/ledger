import { Result, UnauthorizedException } from '@/core/shared/domain';
import { toErrorMap } from '../mappers';
import { ActionFn, Middleware } from './action.types';

// TODO: replace with real JWT verification once token service is wired in
const verifyToken = (_token: string): { id: string; email: string } => {
  throw new UnauthorizedException();
};

const withAuth = <TValue>(): Middleware<TValue> => ({
  handle(next: ActionFn<TValue>): ActionFn<TValue> {
    return async (body, ctx) => {
      try {
        const token = ctx.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
          throw new UnauthorizedException();
        }

        const user = verifyToken(token);
        return next(body, { ...ctx, user });
      } catch (error: unknown) {
        return Result.fail(toErrorMap(error));
      }
    };
  },
});

export { withAuth };
