abstract class Command<TResponse = unknown> {
  declare readonly _response: TResponse;
}

export { Command };
