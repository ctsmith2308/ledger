import { Result } from '@/core/shared/domain';
import { HttpErrorResponse } from '../mappers';

type AuthenticatedUser = {
  id: string;
  email: string;
};

type ActionContext = {
  headers: Headers;
  user?: AuthenticatedUser;
};

type ActionFn<TValue> = (
  body: unknown,
  ctx: ActionContext,
) => Promise<Result<TValue, HttpErrorResponse>>;

interface Middleware<TValue> {
  handle(next: ActionFn<TValue>): ActionFn<TValue>;
}

export type { AuthenticatedUser, ActionContext, ActionFn, Middleware };
