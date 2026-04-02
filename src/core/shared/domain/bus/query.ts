abstract class Query<TResponse = unknown> {
  static readonly type: string;
  declare readonly _response: TResponse;
}

export { Query };
