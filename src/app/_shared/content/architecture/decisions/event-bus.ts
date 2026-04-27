import { type ArchitectureDecision } from '../types';

const eventBus: ArchitectureDecision = {
  slug: 'event-bus',
  title: 'In-process event bus',
  subtitle:
    'Domain events decouple what happened from what happens next. The interface hides the delivery mechanism.',
  badge: 'Infrastructure',
  context:
    "After a user registers, a welcome email should eventually be sent. After login, an audit log entry should be written. These are side effects that shouldn't be the core operation's responsibility. Putting them directly in the handler couples unrelated concerns and makes the handler harder to test.",
  decision:
    'Domain events are dispatched via an `IEventBus` interface backed by an `EventBus` that persists every event to Postgres, then publishes to QStash for async handler execution. Events follow two ownership patterns: aggregate-raised events for state changes the aggregate owns, and handler-dispatched events for use-case-level facts that no single aggregate owns.',
  rationale: [
    "Aggregate-raised events describe the aggregate's own state change (`user.addDomainEvent(new UserRegisteredEvent(...))`). The handler pulls them after persistence and dispatches them via the bus.",
    'Handler-dispatched events describe use-case facts (login failures, logouts, account deletions) where no single aggregate owns the action. The handler dispatches directly via `eventBus.dispatch()`.',
    'Events are pulled or dispatched after the operation succeeds, not before. This avoids dispatching events for operations that fail to persist.',
    'The `IEventBus` interface in the domain layer means the domain has zero knowledge of how events are delivered. In tests, pass a mock or no-op implementation.',
    "Handler registration (`eventBus.register(IdentityEvents.USER_REGISTERED, handler)`) is additive. New side effects don't touch existing code.",
  ],
  tradeoffs: [
    {
      pro: "Handlers are focused. They don't know or care about side effects downstream.",
      con: 'Handler-dispatched events lack the compile-time traceability of aggregate-raised events. A developer has to read the handler to know which events it emits.',
    },
    {
      pro: 'The IEventBus interface means swapping the delivery mechanism is an infrastructure change, not a domain change.',
      con: 'QStash adds an external dependency for async dispatch. If QStash is down, events are persisted but handler execution is delayed until the publish succeeds or is retried.',
    },
  ],
  codeBlocks: [
    {
      label:
        'IEventBus interface. Defined in domain, no infrastructure dependency',
      code: `type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

interface IEventBus {
  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}`,
    },
    {
      label: 'Aggregate-raised event. The aggregate owns the state change',
      code: `class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const tier = UserTier.from(USER_TIERS.TRIAL);
    const user = new User(id, email, passwordHash, tier);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }
}

// Handler pulls after persistence
await this.userRepository.save(user);
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);`,
    },
    {
      label: 'Aggregate-raised event. User owns the login event',
      code: `// LoginUserHandler. Aggregate-raised via User.loggedIn()
user.loggedIn();
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);`,
    },
    {
      label: 'Handler-dispatched event. No aggregate owns the action',
      code: `// LogoutUserHandler. Handler-dispatched, no aggregate owns logout
await this.eventBus.dispatch([
  new UserLoggedOutEvent(userId),
]);`,
    },
  ],
};

export { eventBus };
