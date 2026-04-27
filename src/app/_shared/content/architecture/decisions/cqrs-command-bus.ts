import { type ArchitectureDecision } from '../types';

const cqrsCommandBus: ArchitectureDecision = {
  slug: 'cqrs-command-bus',
  title: 'CQRS with a typed Command Bus',
  subtitle:
    'Commands and queries are separate concerns. The bus makes dispatch type-safe without boilerplate.',
  badge: 'Application layer',
  context:
    "The original implementation wired handlers directly into an identity module object (`identityModule.loginUser.execute(dto)`). As the number of commands grew, two problems showed up: the module became a dependency magnet where every handler's dependencies had to be instantiated in one place, and call sites had to know which module owned which handler.",
  decision:
    "Introduce a CommandBus and QueryBus in the shared infrastructure layer. Each module registers its handlers in a composition root (`api/index.ts`) via a Module class with explicit dependency wiring. Dispatch is the only public API. Callers don't need to know which handler runs.",
  rationale: [
    'Each module has a composition root that wires all dependencies and registers handlers against the bus. The full dependency graph is visible in one place.',
    'Return types are inferred via a phantom field (`declare readonly _response: TResponse`) on the Command base class. No explicit generic needed at the call site. TypeScript infers it from the command instance.',
    'The `{ name: string; prototype: T }` type for the CommandClass parameter avoids both `Function` and `any` while still inferring T from the class prototype. Every class satisfies this shape automatically.',
    'Adding a new command means one new folder for the command and handler, plus one registration call in the module root. No barrel update, no handler map.',
  ],
  tradeoffs: [
    {
      pro: 'Call sites are thin. `commandBus.dispatch(new LoginUserCommand(dto))` is the full API surface.',
      con: 'If a handler is never registered, the error surfaces at runtime, not compile time.',
    },
    {
      pro: 'Phantom types give full response type inference without a code generator or explicit generics.',
      con: 'The phantom type pattern (`declare readonly _response`) is non-obvious to engineers unfamiliar with it.',
    },
    {
      pro: 'Each command folder is self-contained. Command and handler live together, registration happens in the module root.',
      con: 'The module composition root grows with each new command. At enough handlers this file gets long, but it stays straightforward.',
    },
  ],
  codeBlocks: [
    {
      label: 'Before. Direct handler call',
      code: `// Call site had to know the module and handler name
const result = await identityModule.loginUser.execute(dto);`,
    },
    {
      label: 'After. Bus dispatch with inferred return type',
      code: `// Return type is LoginUserResponse, inferred, no explicit generic
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
const { jwt } = result.getValueOrThrow();`,
    },
    {
      label: 'Phantom type on the Command base class',
      code: `abstract class Command<TResponse = unknown> {
  // compile-time only, zero runtime cost
  declare readonly _response: TResponse;
}

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(readonly email: string, readonly password: string) {
    super();
  }
}`,
    },
    {
      label: 'Handler registration in the module composition root',
      code: `// api/index.ts
import { commandBus, eventBus, prisma } from '@/core/shared/infrastructure';
import { UserRepository, PasswordHasher } from '../infrastructure';
import { LoginUserCommand, LoginUserHandler } from '../application';
import { IdentityService } from './identity.service';

class IdentityModule {
  private constructor() {}

  static init(): IdentityService {
    const repos = {
      userRepository: new UserRepository(prisma),
    };

    commandBus.register(
      LoginUserCommand,
      new LoginUserHandler(
        repos.userRepository,
        eventBus,
        PasswordHasher,
      ),
    );

    // ... other command/query registrations

    return new IdentityService(commandBus, queryBus, JwtService);
  }
}

const identityService = IdentityModule.init();
export { identityService };`,
    },
  ],
};

export { cqrsCommandBus };
