abstract class Command<TResponse = unknown> {
  static readonly type: string;
  declare readonly _response: TResponse;
}

export { Command };
