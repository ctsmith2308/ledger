import { type ArchitectureDecision } from '../types';

const serverActions: ArchitectureDecision = {
  slug: 'server-actions',
  title: 'Next.js server actions via next-safe-action',
  subtitle:
    'Composable middleware, schema validation, and a single catch boundary via next-safe-action.',
  badge: 'Transport layer',
  context:
    'Server actions are the transport layer, the equivalent of controllers in an MVC stack. Without a shared factory, each action ends up with its own try/catch, its own session check, and its own response shape. That duplication diverges fast.',
  decision:
    'All server actions are wired via `next-safe-action`. An `actionClient` is configured once with `handleServerError` as the single catch boundary. Each action chains `.use()` middleware for auth, rate limiting, and feature flags, then declares its input schema via `.inputSchema()`. Module services return DTOs directly, so actions never call `getValueOrThrow()`. Server actions are POST-only; reads use server-side loaders.',
  rationale: [
    '`.use(withAuth)` resolves the session before the handler runs and injects it into `ctx`. A missing or invalid session gets rejected before the handler is ever called.',
    '`handleServerError` is the single catch boundary. It maps thrown errors via `toErrorResponse` and returns `{ code, message }` as `result.serverError`. No per-action error handling needed.',
    '`toErrorResponse` maps `DomainException`, Prisma errors, and unexpected errors to stable external codes. The client never sees stack traces or internal exception names.',
    'The `handleActionResponse()` utility bridges next-safe-action results to TanStack Query. It checks `result.serverError` and throws `ActionError(code, message)`, which TanStack Query catches for retry and global error handling.',
  ],
  tradeoffs: [
    {
      pro: 'Middleware is composable. `.use(withAuth).use(withRateLimit)` reads like a pipeline and each concern is independently testable.',
      con: 'next-safe-action is a third-party dependency. A breaking change in its API affects every action simultaneously.',
    },
    {
      pro: 'Schema validation, session resolution, and error mapping are configured once on the `actionClient`, not per action.',
      con: 'Engineers unfamiliar with next-safe-action need to understand the `.use()` chaining and `handleServerError` flow before they can reason about any action.',
    },
  ],
  codeBlocks: [
    {
      label: 'Unprotected action. Rate-limited with input schema',
      code: `'use server';

const loginAction = actionClient
  .metadata({ actionName: 'loginUser' })
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    return identityService.loginUser(
      parsedInput.email,
      parsedInput.password,
    );
  });`,
    },
    {
      label: 'Protected action. Auth, feature flag, and input schema',
      code: `'use server';

const createBudgetAction = actionClient
  .metadata({ actionName: 'createBudget' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.BUDGET_WRITE))
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsService.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });`,
    },
    {
      label: 'actionClient setup with handleServerError + handleActionResponse bridge',
      code: `// actionClient. Single catch boundary + tracing middleware
const actionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ actionName: z.string() }),

  handleServerError: (error): ErrorResponse => {
    logger.error(error instanceof Error ? error.message : String(error));
    return toErrorResponse(error);
  },
}).use(async ({ metadata, next }) => {
  const span = tracer.startSpan(\`action.\${metadata.actionName}\`);
  try {
    const result = await next();
    span.end();
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    throw error;
  }
});

// handleActionResponse. Bridges next-safe-action to TanStack Query
const handleActionResponse = async <T>(
  response: Promise<SafeActionResponse<T>>,
): Promise<T> => {
  const result = await response;

  if (result.serverError) {
    throw new ActionError(result.serverError.code, result.serverError.message);
  }

  if (result.validationErrors) {
    throw new ActionError('VALIDATION_ERROR', 'The request contains invalid data.');
  }

  return result.data as T;
};`,
    },
  ],
};

export { serverActions };
