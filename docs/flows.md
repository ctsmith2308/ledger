# System Flows

Visual diagrams of the key data flows and architectural boundaries in Ledger. Rendered natively by GitHub's Mermaid support.

---

## Transaction Sync --> Event --> Read Model --> Budget Check

The full end-to-end flow when a user syncs transactions from Plaid. Shows persist-first event dispatch to the event store, sequential handler dispatch, read model materialisation, and budget breach detection.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action
    participant TH as SyncTransactionsHandler
    participant Plaid as Plaid API
    participant DB as Postgres (Write)
    participant EB as EventBus
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

How the four bounded contexts communicate through the shared event bus. Each module registers handlers during initialisation. Cross-module communication is event-driven -- no direct imports between module domains.

```mermaid
flowchart TB
    subgraph Shared Infrastructure
        CB[CommandBus]
        QB[QueryBus]
        EB[EventBus -- singleton]
        ES[(domain_events table)]
        EB -->|persist first| ES
    end

    subgraph Identity Module
        IC[IdentityService]
        IR[RegisterUser / LoginUser / MFA]
        IR -->|UserRegistered - UserLoggedIn - MfaEnabled| EB
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
        RSH -->|BudgetExceeded - ThresholdReached| EB
    end

    CB --> IC & BC & TC & BUC
    QB --> IC & BC & TC & BUC
```

---

## Layered Architecture (Per Module)

Every module follows the same layer structure. Dependencies point inward -- domain has zero infrastructure knowledge. The transport layer is the only framework-coupled piece.

```mermaid
flowchart LR
    subgraph Transport
        SA[Server Actions<br/>next-safe-action]
    end

    subgraph API
        APISVC[Service<br/>dispatches via bus - maps to DTO]
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
        INFRASVC[Services<br/>Plaid - Argon2 - JWT - TOTP]
        BUS[EventBus - CommandBus - QueryBus]
    end

    SA --> APISVC --> CMD --> AGG & VO & DE & RI
    CMD --> BUS
    EH --> BUS
    RI -.->|implemented by| REPO
    REPO --> INFRASVC
```

---

## Event Bus -- Persist, Publish, Process

The event lifecycle from aggregate to handler. Every event is persisted to Postgres, then published to QStash for async handler execution via a webhook. Failed handlers are tracked and retryable.

```mermaid
flowchart TD
    A[Aggregate raises DomainEvent] --> B[Handler calls eventBus.dispatch]
    B --> C[Persist to domain_events table<br/>status: pending]
    C --> D{Handlers registered?}
    D -->|No| E[Mark processed<br/>audit only]
    D -->|Yes| F[Publish to QStash]
    F --> G[QStash calls /api/events webhook]
    G --> H[eventBus.process runs handlers sequentially]
    H --> I{All handlers succeed?}
    I -->|Yes| J[Mark processed<br/>set processedAt]
    I -->|No| K[Mark failed<br/>increment attempts<br/>store error]
    K --> L{attempts < 3?}
    L -->|Yes| M[Available for replayFailed]
    L -->|No| N[Dead -- requires manual review]
```

---

## Auth Flow -- Registration

The identity module's registration command flow from server action through to aggregate persistence and event dispatch.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action<br/>withRateLimit
    participant SVC as IdentityService
    participant CB as CommandBus
    participant RH as RegisterUserHandler
    participant DB as Postgres
    participant EB as EventBus

    UI->>SA: register(firstName, lastName, email, password)
    SA->>SVC: registerUser(...)
    SVC->>CB: dispatch(RegisterUserCommand)
    CB->>RH: execute
    RH->>RH: Email.create() / Password.create()<br/>FirstName.create() / LastName.create()
    RH->>RH: hash password
    RH->>DB: userRepository.save(user)
    RH->>DB: userProfileRepository.save(profile)
    Note over RH: UserRegisteredEvent (aggregate-raised)
    RH->>RH: user.pullDomainEvents()
    RH->>EB: dispatch(events)
    RH-->>SVC: Result.ok({ type: SUCCESS, user })
    SVC-->>SA: UserDTO
```

---

## Auth Flow -- Login (No MFA)

When the user does not have MFA enabled, login completes in a single step. The handler raises `UserLoggedInEvent` via the aggregate, creates a `UserSession` in Postgres, and `IdentityService` signs the JWT. The action sets both cookies via `AuthManager.setSession()`. Feature flags are loaded lazily by the `withFeatureFlag` middleware on the first gated action, not at login time.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action<br/>withRateLimit
    participant SVC as IdentityService
    participant CB as CommandBus
    participant LH as LoginUserHandler
    participant DB as Postgres
    participant EB as EventBus

    UI->>SA: login(email, password)
    SA->>SVC: loginUser(email, password)
    SVC->>CB: dispatch(LoginUserCommand)
    CB->>LH: execute
    LH->>DB: userRepository.findByEmail
    LH->>LH: verify password hash
    LH->>LH: user.loggedIn()
    LH->>DB: sessionRepository.save(session)
    Note over LH: UserLoggedInEvent (aggregate-raised)
    LH->>LH: user.pullDomainEvents()
    LH->>EB: dispatch(events)
    LH-->>SVC: Result.ok({ type: SUCCESS, user, sessionId })
    SVC->>SVC: jwtService.signAccess(userId)
    SVC-->>SA: { type: SUCCESS, token, sessionId }
    SA->>SA: AuthManager.setSession(token, sessionId)
    SA-->>UI: redirect /overview
```

---

## Auth Flow -- Login (MFA Enabled)

When the user has MFA enabled, login is a two-step flow. The first step returns a short-lived challenge token. The client stores it in `sessionStorage` and redirects to `/mfa`. The second step verifies the TOTP code and completes login.

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant SA as Server Action<br/>withRateLimit
    participant SVC as IdentityService
    participant CB as CommandBus
    participant LH as LoginUserHandler
    participant VH as VerifyMfaLoginHandler
    participant DB as Postgres
    participant EB as EventBus

    Note over UI,EB: Step 1 -- Credential Check
    UI->>SA: login(email, password)
    SA->>SVC: loginUser(email, password)
    SVC->>CB: dispatch(LoginUserCommand)
    CB->>LH: execute
    LH->>DB: userRepository.findByEmail
    LH->>LH: verify password hash
    LH->>LH: user.mfaEnabled == true
    LH-->>SVC: Result.ok({ type: MFA_REQUIRED, user })
    SVC->>SVC: jwtService.signChallenge(userId)
    SVC-->>SA: { type: MFA_REQUIRED, token }
    SA-->>UI: { challengeToken: token }
    UI->>UI: sessionStorage.set(challengeToken)
    UI->>UI: redirect /mfa

    Note over UI,EB: Step 2 -- TOTP Verification
    UI->>SA: verifyMfaLogin(challengeToken, totpCode)
    SA->>SVC: verifyMfaLogin(challengeToken, totpCode)
    SVC->>SVC: jwtService.verify(token, mfa_challenge)
    SVC->>CB: dispatch(VerifyMfaLoginCommand)
    CB->>VH: execute
    VH->>DB: userRepository.findById
    VH->>VH: totpService.verify(secret, code)
    VH->>VH: user.loggedIn()
    VH->>DB: sessionRepository.save(session)
    Note over VH: UserLoggedInEvent (aggregate-raised)
    VH->>VH: user.pullDomainEvents()
    VH->>EB: dispatch(events)
    VH-->>SVC: Result.ok({ type: SUCCESS, user, sessionId })
    SVC->>SVC: jwtService.signAccess(userId)
    SVC-->>SA: { token, sessionId }
    SA->>SA: AuthManager.setSession(token, sessionId)
    SA-->>UI: redirect /overview
```

---

## MFA Setup Flow

MFA setup is a two-step process gated by `withAuth` and `withFeatureFlag(MFA)`. The first step generates a TOTP secret and returns a QR code. The second step verifies a TOTP code to confirm setup, raising `MfaEnabledEvent` from the aggregate.

```mermaid
sequenceDiagram
    participant UI as Settings Page
    participant SA1 as setupMfaAction<br/>withAuth + withFeatureFlag
    participant SVC as IdentityService
    participant CB as CommandBus
    participant SH as SetupMfaHandler
    participant DB as Postgres

    UI->>SA1: setupMfa()
    SA1->>SVC: setupMfa(userId)
    SVC->>CB: dispatch(SetupMfaCommand)
    CB->>SH: execute
    SH->>SH: totpService.generateSecret()
    SH->>SH: user.setMfaSecret(secret)
    SH->>DB: userRepository.save(user)
    SH->>SH: totpService.generateQrDataUrl(secret, email)
    SH-->>SVC: Result.ok({ qrCodeDataUrl })
    SVC-->>SA1: { qrCodeDataUrl }
    SA1-->>UI: display QR code
```

```mermaid
sequenceDiagram
    participant UI as Settings Page
    participant SA2 as verifyMfaSetupAction<br/>withAuth + withFeatureFlag
    participant SVC as IdentityService
    participant CB as CommandBus
    participant VH as VerifyMfaSetupHandler
    participant DB as Postgres
    participant EB as EventBus

    UI->>SA2: verifyMfaSetup(totpCode)
    SA2->>SVC: verifyMfaSetup(userId, totpCode)
    SVC->>CB: dispatch(VerifyMfaSetupCommand)
    CB->>VH: execute
    VH->>DB: userRepository.findById
    VH->>VH: totpService.verify(secret, code)
    VH->>VH: user.confirmMfa()
    Note over VH: MfaEnabledEvent (aggregate-raised)
    VH->>DB: userRepository.save(user)
    VH->>VH: user.pullDomainEvents()
    VH->>EB: dispatch(events)
    VH-->>SVC: Result.ok(user)
    SA2-->>UI: MFA enabled
```

---

## Feature Flag Flow

Feature flags follow a cache-aside pattern. The `withFeatureFlag` middleware checks the Upstash cache on every gated action. On cache miss (first access, TTL expired, or invalidated), it falls back to the database and repopulates the cache.

```mermaid
flowchart TD
    subgraph Login -- Cache Population
        L1[LoginUserHandler / VerifyMfaLoginHandler] --> L2[featureFlagRepo.findEnabledByTier]
        L2 --> L3[featureFlagCache.setFeatures<br/>Upstash]
    end

    subgraph Server Action -- Cache Check
        A1[Server Action] --> A2[withAuth middleware]
        A2 --> A3["withFeatureFlag(feature) middleware"]
        A3 --> A4{featureFlagCache.getFeatures}
        A4 -->|cache hit| A5{feature enabled?}
        A4 -->|cache miss| A6[identityService.getUserAccount]
        A6 --> A7[featureFlagRepo.findEnabledByTier]
        A7 --> A8[featureFlagCache.setFeatures]
        A8 --> A5
        A5 -->|yes| A9[proceed to action handler]
        A5 -->|no| A10[throw FeatureDisabledException]
    end
```

---

## Domain Event Inventory

Summary of all domain events, their ownership pattern, and dispatch origin.

| Event | Owner | Pattern |
|---|---|---|
| `UserRegisteredEvent` | `User.register()` | Aggregate-raised |
| `UserLoggedInEvent` | `User.loggedIn()` | Aggregate-raised |
| `UserProfileUpdatedEvent` | `UserProfile.updateName()` / `UserProfile.save()` | Aggregate-raised |
| `MfaEnabledEvent` | `User.confirmMfa()` | Aggregate-raised |
| `MfaDisabledEvent` | `User.disableMfa()` | Aggregate-raised |
| `BankAccountLinkedEvent` | `PlaidItem.create()` | Aggregate-raised |
| `BudgetCreatedEvent` | `Budget.create()` | Aggregate-raised |
| `TransactionCreatedEvent` | `Transaction.create()` | Aggregate-raised |
| `LoginFailedEvent` | `LoginUserHandler` | Handler-dispatched |
| `UserLoggedOutEvent` | `LogoutUserHandler` | Handler-dispatched |
| `AccountDeletedEvent` | `DeleteAccountHandler` | Handler-dispatched |
| `BankAccountUnlinkedEvent` | `UnlinkBankHandler` | Handler-dispatched |
| `BudgetExceededEvent` | `recordSpend` event handler | Handler-dispatched |
| `BudgetThresholdReachedEvent` | `recordSpend` event handler | Handler-dispatched |
| `SyncMismatchEvent` | `SyncTransactionsHandler` | Handler-dispatched |
