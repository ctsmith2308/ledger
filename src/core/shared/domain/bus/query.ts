abstract class Query<TResponse = unknown> {
  declare readonly _response: TResponse;
}

export { Query };
