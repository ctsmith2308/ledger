import { trace } from '@opentelemetry/api';

import { Command, type IObservabilityService } from '@/core/shared/domain';

import { IHandler } from '@/core/shared/domain';

type AnyCommand = Command<unknown>;

const tracer = trace.getTracer('ledger');

class CommandBus {
  private readonly _handlers = new Map<string, IHandler<AnyCommand, unknown>>();

  constructor(private readonly observability: IObservabilityService) {}

  register<T extends AnyCommand>(
    CommandClass: { type: string; prototype: T },
    handler: IHandler<T, T['_response']>,
  ): void {
    this._handlers.set(
      CommandClass.type,
      handler as IHandler<AnyCommand, unknown>,
    );
  }

  async dispatch<T extends AnyCommand>(command: T): Promise<T['_response']> {
    const key = (command.constructor as unknown as { type: string }).type;

    const handler = this._handlers.get(key);

    if (!handler) {
      throw new Error(`No handler registered for command: ${key}`);
    }

    // startActiveSpan sets this span as the active context parent.
    // If infrastructure adapters (Prisma, Redis, Plaid) add their own
    // spans in the future, they will automatically nest under this one.
    // Switch to startSpan if parent context is not needed.
    return tracer.startActiveSpan(`command.${key}`, async (span) => {
      try {
        const result = (await handler.execute(command)) as Promise<
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

export { CommandBus };
