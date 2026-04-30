/**
 * Handler contract (CQRS). Every command and query handler implements
 * this interface. The execute method receives a typed request and
 * returns a typed response (typically Result<T, DomainException>).
 *
 * Handlers are the application layer's unit of work. They orchestrate
 * domain operations (validate, persist, dispatch events) but contain
 * no domain logic themselves. Domain logic lives in aggregates and
 * value objects.
 *
 * Handlers are registered against the CommandBus or QueryBus in each
 * module's composition root (api/index.ts).
 */
interface IHandler<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export type { IHandler };
