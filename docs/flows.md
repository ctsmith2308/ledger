# System Flows

Visual diagrams of the key data flows and architectural boundaries in Ledger. Rendered natively by GitHub's Mermaid support.

---

## Transaction Sync → Event → Read Model → Budget Check

The full end-to-end flow when a user syncs transactions from Plaid. Shows the durable event bus persisting to the event store, sequential handler dispatch, read model materialisation, and budget breach detection.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action
    participant TH as SyncTransactionsHandler
    participant Plaid as Plaid API
    participant DB as Postgres (Write)
    participant EB as DurableEventBus
    participant ES as domain_events Table
    participant RH as updateCategoryRollup
    participant RDB as Postgres (Read Model)
    participant RS as recordSpend
    participant BDB as Postgres (Budgets)

    UI->>SA: syncTransactions()
    SA->>TH: dispatch(SyncTransactionsCommand)
    TH->>Plaid: syncTransactions(accessToken)
    Plaid-->>TH: added / modified / removed
    TH->>DB: saveMany(transactions)
    TH->>EB: dispatch([TransactionCreatedEvent])
    EB->>ES: persist (status: pending)
    EB->>RH: handler 1 (sequential)
    RH->>RDB: upsert CategoryRollup
    EB->>RS: handler 2 (sequential)
    RS->>BDB: findByUserIdAndCategory
    RS->>RDB: findByUserAndPeriod
    alt spend >= 100%
        RS->>EB: dispatch(BudgetExceededEvent)
    else spend >= 80%
        RS->>EB: dispatch(BudgetThresholdReachedEvent)
    end
    EB->>ES: update (status: processed)
```

---

## Module Boundaries and Event Flow

How the four bounded contexts communicate through the shared event bus. Each module registers handlers during initialisation. Cross-module communication is event-driven — no direct imports between module domains.

```mermaid
flowchart TB
    subgraph Shared Infrastructure
        CB[CommandBus]
        QB[QueryBus]
        EB[DurableEventBus — singleton]
        ES[(domain_events table)]
        EB -->|persist first| ES
    end

    subgraph Identity Module
        IC[IdentityService]
        IR[RegisterUser / LoginUser]
        IR -->|UserRegistered · UserLoggedIn| EB
    end

    subgraph Banking Module
        BC[BankingService]
        BR[ExchangePublicToken]
        BR -->|BankAccountLinked| EB
    end

    subgraph Transactions Module
        TC[TransactionsService]
        TS[SyncTransactionsHandler]
        TS -->|TransactionCreated| EB
        UR[updateCategoryRollup]
        EB -->|TRANSACTION_CREATED| UR
        UR -->|upsert| RDB[(CategoryRollup<br/>Read Model)]
        GSC[GetSpendingByCategory]
        GSC -->|reads from| RDB
    end

    subgraph Budgets Module
        BUC[BudgetsService]
        RSH[recordSpend]
        EB -->|TRANSACTION_CREATED| RSH
        RSH -->|reads| RDB
        RSH -->|checks| BUDA[(Budgets table)]
        RSH -->|BudgetExceeded · ThresholdReached| EB
    end

    CB --> IC & BC & TC & BUC
    QB --> IC & BC & TC & BUC
```

---

## Layered Architecture (Per Module)

Every module follows the same layer structure. Dependencies point inward — domain has zero infrastructure knowledge. The transport layer is the only framework-coupled piece.

```mermaid
flowchart LR
    subgraph Transport
        SA[Server Actions<br/>next-safe-action]
    end

    subgraph API
        SVC[Service<br/>dispatches via bus · maps to DTO]
    end

    subgraph Application
        CMD[Commands / Queries<br/>handlers return Result]
        EH[Event Handlers<br/>cross-module reactions]
    end

    subgraph Domain
        AGG[Aggregates<br/>business rules]
        VO[Value Objects<br/>validated invariants]
        DE[Domain Events<br/>what happened]
        RI[Repository Interfaces]
    end

    subgraph Infrastructure
        REPO[Repository Impls<br/>Prisma]
        SVC[Services<br/>Plaid · Argon2 · JWT]
        BUS[EventBus · CommandBus · QueryBus]
    end

    SA --> SVC --> CMD --> AGG & VO & DE & RI
    CMD --> BUS
    EH --> BUS
    RI -.->|implemented by| REPO
    REPO --> SVC
```

---

## Durable Event Bus — Persist First, Dispatch Second

The event lifecycle from aggregate to handler. Every event is written to Postgres before any handler executes. Failed handlers are tracked and retryable.

```mermaid
flowchart TD
    A[Aggregate raises DomainEvent] --> B[Handler calls eventBus.dispatch]
    B --> C[Persist to domain_events table<br/>status: pending]
    C --> D{Handlers registered?}
    D -->|No| E[Mark processed]
    D -->|Yes| F[Run handlers sequentially]
    F --> G{All handlers succeed?}
    G -->|Yes| H[Mark processed<br/>set processedAt]
    G -->|No| I[Mark failed<br/>increment attempts<br/>store error]
    I --> J{attempts < 3?}
    J -->|Yes| K[Available for replayFailed]
    J -->|No| L[Dead — requires manual review]
```

---

## Auth Flow — Registration and Login

The identity module's command flow from server action through to session creation.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action<br/>withRateLimit
    participant CB as CommandBus
    participant RH as RegisterUserHandler
    participant DB as Postgres
    participant EB as DurableEventBus
    participant LH as LoginUserHandler
    participant SS as SessionService

    Note over UI,SS: Registration
    UI->>SA: register(email, password)
    SA->>CB: dispatch(RegisterUserCommand)
    CB->>RH: execute
    RH->>RH: Email.create() · Password.create()
    RH->>DB: userRepository.save(user)
    RH->>EB: dispatch(UserRegisteredEvent)
    RH-->>SA: Result.ok(user)

    Note over UI,SS: Login
    UI->>SA: login(email, password)
    SA->>CB: dispatch(LoginUserCommand)
    CB->>LH: execute
    LH->>DB: userRepository.findByEmail
    LH->>LH: verify password hash
    LH->>DB: userSessionRepository.save(session)
    LH->>EB: dispatch(UserLoggedInEvent)
    LH-->>SA: Result.ok({ sessionId })
    SA->>SS: set session cookie
```
