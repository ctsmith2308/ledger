import { type ArchitectureDecision } from '../types';

const domainDrivenDesign: ArchitectureDecision = {
  slug: 'domain-driven-design',
  title: 'Domain-Driven Design',
  subtitle:
    "A finance domain has real invariants worth modelling explicitly. A todo app wouldn't justify this.",
  badge: 'Domain layer',
  context:
    "DDD is overused as a buzzword and underused as an actual discipline. The choice to apply it here isn't fashion — it's that a personal finance domain genuinely has invariants that need enforcement. An email address isn't just a string. A password has strength requirements. A user aggregate has registration lifecycle rules. These rules belong in the domain, not scattered across handlers and validators.",
  decision:
    'Apply DDD-lite: aggregates, value objects, domain events, and repository interfaces in the domain layer. No IoC container, no decorators. Dependencies are wired explicitly. The domain knows nothing about Next.js, Prisma, or HTTP — only about business rules.',
  rationale: [
    'Value objects validate invariants at construction time. `Email.create("not-an-email")` returns `Result.fail(new InvalidEmailException())` — invalid state can never be represented.',
    'The `Result<T, E>` type makes failure explicit at every boundary. No exceptions bubble silently through the call stack; every failure path is a typed value.',
    'Repository interfaces are defined in the domain layer and implemented in infrastructure. The domain can be tested without a database — pass a mock that implements `IUserRepository`.',
    'Domain events capture what happened in business terms. Aggregate-raised events (e.g., `UserRegistered`) are pulled after persistence and dispatched via the event bus. Handler-dispatched events (e.g., `UserLoggedIn`, `LoginFailed`) are dispatched directly for use-case facts that no single aggregate owns. Both flow through the same DurableEventBus.',
    'No IoC container means the full dependency graph is visible. `RegisterUserHandler` takes `IUserRepository`, `IEventBus`, `IPasswordHasher`, `IIdGenerator` — exactly what it needs, nothing hidden.',
  ],
  tradeoffs: [
    {
      pro: 'Invalid domain state is unrepresentable — validation at construction means no defensive checks in handlers.',
      con: 'More ceremony than a simple CRUD approach. Value objects, factories, and Result types add lines of code that a junior engineer might question.',
    },
    {
      pro: 'Domain layer is fully testable without infrastructure — unit tests run in milliseconds with no database.',
      con: 'Manual wiring adds boilerplate that a DI container would eliminate. Acceptable at this scale; unwieldy at 50 modules.',
    },
    {
      pro: 'Repository interfaces make the persistence strategy swappable — Prisma today, anything else tomorrow.',
      con: 'Two mapper layers (domain → DTO, Prisma record → domain) add indirection that can feel excessive for simple read operations.',
    },
  ],
  codeBlocks: [
    {
      label: 'Value object — invalid state is unrepresentable',
      code: `class Email {
  private constructor(public readonly address: string) {}

  static create(value: string): Result<Email, InvalidEmailException> {
    const error = _validate(value);
    if (error) return Result.fail(error);
    return Result.ok(new Email(value));
  }
}

const _validate = (value: string): InvalidEmailException | null => {
  if (!value.includes('@')) return new InvalidEmailException();
  return null;
};`,
    },
    {
      label: 'Domain events — two ownership patterns',
      code: `// Aggregate-raised: the aggregate owns the state change
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }
}

// Handler pulls after persistence
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);

// Handler-dispatched: no aggregate owns the action
await this.eventBus.dispatch([new LoginFailedEvent(email, 'user_not_found')]);`,
    },
    {
      label:
        'Repository interface in domain, implementation in infrastructure',
      code: `// domain/repositories/user.repository.ts — no Prisma import
interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/repository/user.repository.ts — Prisma lives here
class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ ... });
    return record ? UserPrismaMapper.toDomain(record) : null;
  }
}`,
    },
  ],
};

export { domainDrivenDesign };
