import { type ArchitectureDecision } from '../types';

const serverActions: ArchitectureDecision = {
  slug: 'server-actions',
  title: 'Next.js server actions via next-safe-action',
  subtitle:
    'Composable middleware, schema validation, and a single catch boundary — powered by next-safe-action.',
  badge: 'Transport layer',
  context:
    'Server actions are the transport layer — the equivalent of controllers in an MVC stack. Without a shared factory, each action needs its own try/catch, its own session check, and its own response shape. Three actions in and the duplication is obvious. Ten actions in and the divergence is a bug waiting to happen.',
  decision:
    'All server actions are wired via `next-safe-action`. An `actionClient` is configured once with `handleServerError` as the single catch boundary. Each action chains `.use()` middleware for auth, rate limiting, and feature flags, then declares its input schema via `.inputSchema()`. Controllers return DTOs directly — actions do not call `getValueOrThrow()`. Server actions are POST-only; reads use server-side loaders.',
  rationale: [
    '`.use(withAuth)` resolves the session before the handler runs and injects it into `ctx`. A missing or invalid session rejects before the handler is ever called.',
    '`handleServerError` is the single catch boundary. It maps thrown errors via `toErrorResponse` and returns `{ code, message }` as `result.serverError` — no per-action error handling needed.',
    '`toErrorResponse` maps `DomainException`, Prisma errors, and unexpected errors to stable external codes. The client never sees stack traces or internal exception names.',
    'The `execute()` utility bridges next-safe-action results to TanStack Query — it checks `result.serverError` and throws `ActionError(code, message)`, which TanStack Query catches for retry and global error handling.',
  ],
  tradeoffs: [
    {
      pro: 'Middleware is composable — `.use(withAuth).use(withRateLimit)` reads like a pipeline and each concern is independently testable.',
      con: 'next-safe-action is a third-party dependency. A breaking change in its API affects every action simultaneously.',
    },
    {
      pro: 'Schema validation, session resolution, and error mapping are configured once on the `actionClient`, not per action.',
      con: 'Engineers unfamiliar with next-safe-action need to understand the `.use()` chaining and `handleServerError` flow before they can reason about any action.',
    },
  ],
  codeBlocks: [
    {
      label: 'Unprotected action — rate-limited with input schema',
      code: `'use server';

const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    return identityController.loginUser(
      parsedInput.email,
      parsedInput.password,
    );
  });`,
    },
    {
      label: 'Protected action — auth, feature flag, and input schema',
      code: `'use server';

const createBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });`,
    },
    {
      label: 'actionClient setup with handleServerError + execute() bridge',
      code: `// actionClient — single catch boundary
const actionClient = createSafeActionClient({
  handleServerError: (err) => {
    logger.error(err);
    return toErrorResponse(err);
  },
});

// execute() — bridges next-safe-action to TanStack Query
const execute = async <T>(
  result: SafeActionResult<T>,
): Promise<T> => {
  if (result.serverError) {
    const { code, message } = result.serverError;
    throw new ActionError(code, message);
  }
  return result.data as T;
};`,
    },
  ],
};

export { serverActions };
