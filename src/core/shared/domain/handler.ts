interface IHandler<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export type { IHandler };
