/**
 * Command base class (CQRS). Commands mutate state and return Result.
 *
 * The phantom field `_response` drives TypeScript's return type
 * inference at dispatch. It exists only at compile time (declare
 * keyword, zero runtime cost). When you call commandBus.dispatch(new
 * LoginUserCommand(...)), TypeScript infers the return type from the
 * command's TResponse generic without an explicit type parameter.
 *
 * The static `type` field is the registration key on the CommandBus.
 * Each concrete command sets it (e.g. static readonly type = 'LoginUserCommand').
 */
abstract class Command<TResponse = unknown> {
  static readonly type: string;
  declare readonly _response: TResponse;
}

export { Command };
