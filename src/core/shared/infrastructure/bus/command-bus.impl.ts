import { trace } from '@opentelemetry/api';

import { Command, type IObservabilityService } from '@/core/shared/domain';

import { IHandler } from '@/core/shared/domain';

type AnyCommand = Command<unknown>;

const tracer = trace.getTracer('ledger');

/**
 * Dispatches commands to registered handlers with OpenTelemetry tracing.
 *
 * Each dispatch creates a child span under the active HTTP request trace,
 * giving handler-level visibility in the trace timeline (e.g. "LoginUser
 * took 45ms" instead of just "POST /login returned in 200ms"). Failures
 * are recorded on the span via ObservabilityService before re-throwing.
 *
 * Registration is explicit via the module composition root (api/index.ts),
 * not via decorators or auto-discovery. If a handler is not registered,
 * dispatch throws at runtime.
 */
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

    /** startActiveSpan sets this span as the active context parent.
     *  Infrastructure adapter spans (Prisma, Redis, Plaid) will
     *  automatically nest under this one. */
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
