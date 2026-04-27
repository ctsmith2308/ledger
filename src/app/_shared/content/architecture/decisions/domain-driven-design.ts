import { type ArchitectureDecision } from '../types';

const domainDrivenDesign: ArchitectureDecision = {
  slug: 'domain-driven-design',
  title: 'Domain-Driven Design (lite)',
  subtitle:
    "A finance domain has real invariants worth modelling explicitly. A todo app wouldn't justify this.",
  badge: 'Domain layer',
  context:
    "DDD is overused as a buzzword and underused as an actual discipline. The reason it's here isn't trend-chasing. A personal finance domain genuinely has invariants worth enforcing: email formats, password strength requirements, user registration lifecycle rules. Those rules belong in the domain layer, not scattered across handlers and validators.",
  decision:
    'Apply DDD-lite: aggregates, value objects, domain events, and repository interfaces in the domain layer. No IoC container, no decorators. Dependencies are wired explicitly. The domain knows nothing about Next.js, Prisma, or HTTP. Only business rules.',
  rationale: [
    'Value objects validate invariants at construction time. `Email.create("not-an-email")` returns `Result.fail(new InvalidEmailException())`. Invalid state simply cannot be represented.',
    'The `Result<T, E>` type makes failure explicit at every boundary. Every failure path is a typed value, so nothing bubbles silently through the call stack.',
    'Repository interfaces live in the domain layer, implementations in infrastructure. The domain can be tested without a database by passing a mock that implements `IUserRepository`.',
    'Domain events capture what happened in business terms. Aggregate-raised events (e.g., `UserRegistered`) get pulled after persistence and dispatched via the event bus. Handler-dispatched events (e.g., `LoginFailed`) are dispatched directly for use-case facts that no single aggregate owns. Both flow through the same DurableEventBus.',
    'No IoC container means the full dependency graph is visible. `RegisterUserHandler` takes `IUserRepository`, `IEventBus`, `IPasswordHasher`, `IIdGenerator`. Exactly what it needs, nothing hidden.',
  ],
  tradeoffs: [
    {
      pro: 'Invalid domain state is unrepresentable. Validation at construction means no defensive checks in handlers.',
      con: 'More ceremony than a simple CRUD approach. Value objects, factories, and Result types add lines of code that a junior engineer might question.',
    },
    {
      pro: 'Domain layer is testable without infrastructure. Unit tests run in milliseconds with no database.',
      con: 'Manual wiring adds boilerplate that a DI container would eliminate. Acceptable at this scale, but would get unwieldy at 50 modules.',
    },
    {
      pro: 'Repository interfaces make the persistence strategy swappable. Prisma today, something else tomorrow.',
      con: 'Two mapper layers (domain to DTO, Prisma record to domain) add indirection that can feel excessive for simple read operations.',
    },
  ],
  codeBlocks: [
    {
      label: 'Value object. Invalid state is unrepresentable',
      code: `class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Result<Email, InvalidEmailException> {
    const trimmed = (email ?? '').trim();

    if (!Email.isValid(trimmed)) {
      return Result.fail(new InvalidEmailException());
    }

    return Result.ok(new Email({ value: trimmed.toLowerCase() }));
  }

  private static isValid(email: string): boolean {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  }
}`,
    },
    {
      label: 'Domain events. Two ownership patterns',
      code: `// Aggregate-raised: the aggregate owns the state change
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const tier = UserTier.from(USER_TIERS.TRIAL);
    const user = new User(id, email, passwordHash, tier);
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
      code: `// domain/repositories/user.repository.ts, no Prisma import
interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/repositories/user.repository.impl.ts, Prisma lives here
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
