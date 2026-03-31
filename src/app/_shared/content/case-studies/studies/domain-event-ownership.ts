import { type CaseStudy } from '../types';

const domainEventOwnership: CaseStudy = {
  slug: 'domain-event-ownership',
  title: 'Domain event ownership — aggregate vs handler',
  subtitle:
    'Not every event belongs to an aggregate. Recognising the difference kept the domain honest.',
  badge: 'Architecture',
  summary:
    'Ledger uses a durable event-driven architecture — events are persisted for audit, cross-module communication, and failure replay, but aggregates are reconstituted from database snapshots, not event streams. That distinction created a question: if events are not the source of truth for state, does every event still need to flow through an aggregate? The answer was no, and formalising that boundary prevented a category of modelling mistakes.',
  sections: [
    {
      heading: 'The orthodox position',
      body: "In event-sourced systems, the aggregate is the sole source of events because the event stream is the state. Every fact about the system must originate from an aggregate method — the aggregate decided it happened, so the aggregate records it. Daniel Whittaker's CQRS walkthrough articulates this clearly: the command handler loads the aggregate, the aggregate executes the behavior and raises events, the handler persists them. No exceptions.",
    },
    {
      heading: 'Where orthodoxy broke down',
      body: 'Ledger is not event-sourced. Events are persisted to a `domain_events` table via a DurableEventBus, but aggregate state lives in Postgres and is rebuilt via `reconstitute()`, not by replaying events. This means events serve audit and integration — they are not the authoritative state record. Forcing every event through an aggregate created three modelling problems that the orthodox model does not account for.',
      table: {
        headers: ['Event', 'Problem with aggregate ownership'],
        rows: [
          [
            'LoginFailedEvent',
            'No aggregate exists — the user was not found or the password was wrong. There is nothing to call addDomainEvent() on.',
          ],
          [
            'AccountDeletedEvent',
            'The aggregate is being destroyed. Having a deleted aggregate raise its own death notice is a lifecycle contradiction.',
          ],
          [
            'UserLoggedInEvent',
            'UserSession.create() was raising this event, but login is a use-case coordination — a session does not know why it was created. It could be a login, a token refresh, or an admin impersonation.',
          ],
        ],
      },
    },
    {
      heading: 'The two-pattern model',
      body: "The resolution was to formalise two event ownership patterns based on a single question: does this event describe the aggregate's own state change? If yes, the aggregate raises it via `addDomainEvent()`. If no — the event spans aggregates, has no owning aggregate, or the aggregate is being destroyed — the handler dispatches it directly via `eventBus.dispatch()`. Both paths flow through the same DurableEventBus and land in the same `domain_events` table.",
      table: {
        headers: ['Event', 'Owner', 'Pattern'],
        rows: [
          ['UserRegisteredEvent', 'User.register()', 'Aggregate-raised'],
          [
            'UserProfileUpdatedEvent',
            'UserProfile.updateName()',
            'Aggregate-raised',
          ],
          ['UserLoggedInEvent', 'LoginUserHandler', 'Handler-dispatched'],
          ['LoginFailedEvent', 'LoginUserHandler', 'Handler-dispatched'],
          ['UserLoggedOutEvent', 'LogoutUserHandler', 'Handler-dispatched'],
          [
            'AccountDeletedEvent',
            'DeleteAccountHandler',
            'Handler-dispatched',
          ],
        ],
      },
    },
    {
      heading: 'Why not full event sourcing',
      body: 'Full event sourcing would resolve the ownership question by requiring every event to flow through an aggregate — but it also requires aggregate reconstitution from event replay, a message broker for reliable delivery and projection rebuilds, and snapshot strategies for long-lived aggregates. The infrastructure cost is significant and not justified at this scale. The current architecture — durable event persistence with database-backed aggregate state — provides the audit trail and cross-module decoupling benefits without the operational overhead. The IEventBus interface preserves the upgrade path if the system grows into it.',
    },
  ],
};

export { domainEventOwnership };
