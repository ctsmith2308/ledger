import { type ArchitectureDecision } from '../types';

const cqrsCommandBus: ArchitectureDecision = {
  slug: 'cqrs-command-bus',
  title: 'CQRS with a typed Command Bus',
  subtitle:
    'Commands and queries are separate concerns. The bus makes dispatch type-safe without boilerplate.',
  badge: 'Application layer',
  context:
    "The original implementation wired handlers directly into an identity module object — `identityModule.loginUser.execute(dto)`. As the number of commands grew, two problems emerged: the module became a dependency magnet (every handler's dependencies had to be instantiated in one place), and call sites had to know which module owned which handler.",
  decision:
    "Introduce a CommandBus and QueryBus in the shared infrastructure layer. Each command lives in its own folder and self-registers against the bus on import. Dispatch is the only public API — callers don't need to know which handler runs.",
  rationale: [
    'Handler registration is a side effect of importing the command folder. The module file becomes three import lines instead of a dependency wiring block.',
    'Return types are inferred via a phantom field (`declare readonly _response: TResponse`) on the Command base class. No explicit generic needed at the call site — TypeScript infers it from the command instance.',
    'The `{ name: string; prototype: T }` type for the CommandClass parameter avoids both `Function` and `any` while still inferring T from the class prototype. Every class satisfies this shape automatically.',
    'Adding a new command requires one new folder. Nothing else changes — no module registration, no barrel update, no handler map.',
  ],
  tradeoffs: [
    {
      pro: 'Call sites are thin — `commandBus.dispatch(new LoginUserCommand(dto))` is the full API surface.',
      con: 'Handler registration happens as a module side effect. If the import is missing, the error is at runtime, not compile time.',
    },
    {
      pro: 'Phantom types give full response type inference without a code generator or explicit generics.',
      con: 'The phantom type pattern (`declare readonly _response`) is non-obvious to engineers unfamiliar with it.',
    },
    {
      pro: 'Each command folder is fully self-contained — command, handler, and registration in one place.',
      con: 'Each command folder constructs its own infrastructure instances. Shared state across handlers (e.g. a singleton event bus) must be imported explicitly at each wiring site.',
    },
  ],
  codeBlocks: [
    {
      label: 'Before — direct handler call',
      code: `// Call site had to know the module and handler name
const result = await identityModule.loginUser.execute(dto);`,
    },
    {
      label: 'After — bus dispatch with inferred return type',
      code: `// Return type is LoginUserResponse — inferred, no explicit generic
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
const { jwt } = result.getValueOrThrow();`,
    },
    {
      label: 'Phantom type on the Command base class',
      code: `abstract class Command<TResponse = unknown> {
  // compile-time only — zero runtime cost
  declare readonly _response: TResponse;
}

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(readonly email: string, readonly password: string) {
    super();
  }
}`,
    },
    {
      label: 'Self-registration in the command folder index',
      code: `// commands/login-user/index.ts
import { commandBus, eventBus, prisma } from '@/core/shared/infrastructure';
import { UserRepository, UserSessionRepository } from '../../../infrastructure/repository';
import { PasswordHasher, IdGenerator } from '../../../infrastructure/services';
import { LoginUserCommand } from './login-user.command';
import { LoginUserHandler } from './login-user.handler';

commandBus.register(
  LoginUserCommand,
  new LoginUserHandler(
    new UserRepository(prisma),
    new UserSessionRepository(prisma),
    eventBus,
    PasswordHasher,
    IdGenerator,
  ),
);

export { LoginUserCommand };
export type { LoginUserResponse } from './login-user.command';`,
    },
  ],
};

export { cqrsCommandBus };
