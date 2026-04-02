import { trace } from '@opentelemetry/api';

import { Query, type IObservabilityService } from '@/core/shared/domain';

import { IHandler } from '@/core/shared/domain';

type AnyQuery = Query<unknown>;

const tracer = trace.getTracer('ledger');

class QueryBus {
  private readonly _handlers = new Map<string, IHandler<AnyQuery, unknown>>();

  constructor(private readonly observability: IObservabilityService) {}

  register<T extends AnyQuery>(
    QueryClass: { type: string; prototype: T },
    handler: IHandler<T, T['_response']>,
  ): void {
    this._handlers.set(QueryClass.type, handler as IHandler<AnyQuery, unknown>);
  }

  async dispatch<T extends AnyQuery>(query: T): Promise<T['_response']> {
    const key = (query.constructor as unknown as { type: string }).type;

    const handler = this._handlers.get(key);

    if (!handler) {
      throw new Error(`No handler registered for query: ${key}`);
    }

    // startActiveSpan sets this span as the active context parent.
    // If infrastructure adapters (Prisma, Redis, Plaid) add their own
    // spans in the future, they will automatically nest under this one.
    // Switch to startSpan if parent context is not needed.
    return tracer.startActiveSpan(`query.${key}`, async (span) => {
      try {
        const result = (await handler.execute(query)) as Promise<
          T['_response']
        >;
        span.end();
        return result;
      } catch (error) {
        this.observability.recordHandlerFailure(key, error);
        span.end();
        throw error;
      }
    });
  }
}

export { QueryBus };
