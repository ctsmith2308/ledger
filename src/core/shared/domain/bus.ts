abstract class Command<TResponse = unknown> {
  declare readonly _response: TResponse;
}

abstract class Query<TResponse = unknown> {
  declare readonly _response: TResponse;
}

export { Command, Query };
