import { Query, type IObservabilityService } from '@/core/shared/domain';
import { IHandler } from '@/core/shared/domain';

type AnyQuery = Query<unknown>;

class QueryBus {
  private readonly _handlers = new Map<string, IHandler<AnyQuery, unknown>>();

  constructor(
    private readonly observability: IObservabilityService,
  ) {}

  register<T extends AnyQuery>(
    QueryClass: { name: string; prototype: T },
    handler: IHandler<T, T['_response']>,
  ): void {
    this._handlers.set(
      QueryClass.name,
      handler as IHandler<AnyQuery, unknown>,
    );
  }

  async dispatch<T extends AnyQuery>(query: T): Promise<T['_response']> {
    const key = query.constructor.name;

    const handler = this._handlers.get(key);

    if (!handler) {
      throw new Error(`No handler registered for query: ${key}`);
    }

    try {
      return await handler.execute(query) as Promise<T['_response']>;
    } catch (error) {
      this.observability.recordHandlerFailure(key, error);
      throw error;
    }
  }
}

export { QueryBus };
