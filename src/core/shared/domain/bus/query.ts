/**
 * Query base class (CQRS). Queries return data and must not mutate
 * state. Same phantom type pattern as Command for return type inference.
 */
abstract class Query<TResponse = unknown> {
  static readonly type: string;
  declare readonly _response: TResponse;
}

export { Query };
