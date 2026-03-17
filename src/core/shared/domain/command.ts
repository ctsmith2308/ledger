interface IRequest<TResponse> {
  readonly _response?: TResponse;
}

interface IRequestHandler<TRequest extends IRequest<unknown>> {
  execute(request: TRequest): Promise<ResponseOf<TRequest>>;
}

type ResponseOf<T> = T extends IRequest<infer R> ? R : never;

export type { IRequest, IRequestHandler, ResponseOf };
