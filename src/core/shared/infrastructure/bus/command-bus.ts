import { trace } from '@opentelemetry/api';

import { Command, type IObservabilityService } from '@/core/shared/domain';
import { IHandler } from '@/core/shared/domain';

type AnyCommand = Command<unknown>;

const tracer = trace.getTracer('ledger');

class CommandBus {
  private readonly _handlers = new Map<string, IHandler<AnyCommand, unknown>>();

  constructor(
    private readonly observability: IObservabilityService,
  ) {}

  register<T extends AnyCommand>(
    CommandClass: { name: string; prototype: T },
    handler: IHandler<T, T['_response']>,
  ): void {
    this._handlers.set(
      CommandClass.name,
      handler as IHandler<AnyCommand, unknown>,
    );
  }

  async dispatch<T extends AnyCommand>(command: T): Promise<T['_response']> {
    const key = command.constructor.name;

    const handler = this._handlers.get(key);

    if (!handler) {
      throw new Error(`No handler registered for command: ${key}`);
    }

    return tracer.startActiveSpan(`command.${key}`, async (span) => {
      try {
        const result = await handler.execute(command) as Promise<T['_response']>;
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

export { CommandBus };
