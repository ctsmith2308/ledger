import { mapError } from '@/core/shared/infrastructure/mappers';
import { internalLogger } from '@/core/shared/infrastructure/loggers';
import { resolveTraceId } from '@/core/shared/infrastructure/utils';

type ActionSuccess<T> = { success: true; data: T };
type ActionFailure = { success: false; code: string; message: string };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

const publicAction =
  <TInput, TOutput>(handler: (input: TInput) => Promise<TOutput>) =>
  async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      return { success: true, data: await handler(input) };
    } catch (error: unknown) {
      const traceId = resolveTraceId(null);

      internalLogger(error, traceId);

      const { code, message } = mapError(error);

      return { success: false, code, message };
    }
  };

export { publicAction };
export type { ActionResult, ActionSuccess, ActionFailure };
