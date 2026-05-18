import { type ArchitectureDecision } from '../types';

const mfa: ArchitectureDecision = {
  slug: 'mfa',
  title: 'TOTP-based multi-factor authentication',
  subtitle:
    'Two-step login with challenge tokens, aggregate-owned events, and service-layer signing. No auth logic in handlers.',
  badge: 'Security',
  context:
    'Email and password authentication is table stakes. MFA adds a second factor that proves the user has physical access to a device, not just knowledge of a credential. The implementation needed to fit within the existing DDD/CQRS architecture without leaking transport concerns into handlers or coupling domain logic to JWT mechanics.',
  decision:
    'Implement TOTP (Time-based One-Time Password) via the otpauth library. The login flow becomes two-step when MFA is enabled: the first step verifies the password and returns a short-lived challenge token; the second step verifies the TOTP code and returns an access token. The service layer owns all JWT signing. Handlers return domain aggregates and never touch tokens. MFA state lives on the User aggregate with aggregate-raised events for enable/disable.',
  rationale: [
    'TOTP is an open standard (RFC 6238) supported by every major authenticator app. No vendor dependency, no SMS costs, no phone number required.',
    'The two-step login uses a type-based challenge token (5-minute TTL, `JWT_TYPE.MFA_CHALLENGE`) signed by the same JwtService. No database state, no challenge table. The token itself proves the password was verified.',
    'MFA setup is two-phase: SetupMfaCommand generates the TOTP secret and stores it (mfaEnabled stays false). VerifyMfaSetupCommand verifies the first code and calls user.confirmMfa() to enable. If the user abandons setup, the secret sits unused and MFA remains disabled.',
    'The User aggregate owns MFA state transitions: setMfaSecret(), confirmMfa(), disableMfa(), and loggedIn(). Each mutation method raises its own domain event (MfaEnabledEvent, MfaDisabledEvent, UserLoggedInEvent). Handlers orchestrate but never create events directly.',
    'JWT signing is exclusively in the service layer (IdentityService). The LoginUserHandler returns a discriminated union (SUCCESS with the User, or MFA_REQUIRED with the User) and the service decides what to sign. This keeps handlers portable and testable without JWT mocking.',
  ],
  tradeoffs: [
    {
      pro: 'Challenge tokens are stateless. No database table, no cleanup job, no session management for the MFA step.',
      con: 'A stolen challenge token is valid for 5 minutes. Mitigation: stored in sessionStorage (tab-scoped, cleared on close), and useless without a valid TOTP code.',
    },
    {
      pro: 'The TOTP secret is stored in the database alongside the user. Simple persistence, no external service.',
      con: 'The secret is stored in plaintext. A database breach exposes TOTP seeds. Production hardening: encrypt at rest via application-level or database column encryption.',
    },
    {
      pro: 'Handlers return domain aggregates, not tokens. Adding a new auth flow (WebAuthn, passkeys) means a new handler that returns User. The service signing logic stays unchanged.',
      con: 'The service layer accumulates signing responsibility. As auth flows grow, the service method count grows. Acceptable at current scale.',
    },
  ],
  codeBlocks: [
    {
      label: 'Two-step login. Handler returns domain union, service signs',
      code: `// LoginUserHandler, no JWT dependency
if (user.mfaEnabled) {
  return Result.ok({ type: 'MFA_REQUIRED' as const, user });
}

user.loggedIn();
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);
return Result.ok({ type: 'SUCCESS' as const, user });

// IdentityService signs based on the union type
const loginResult = result.getValueOrThrow();
const userId = loginResult.user.id.value;
const isSuccess = loginResult.type === 'SUCCESS';
const type = isSuccess ? JWT_TYPE.ACCESS : JWT_TYPE.MFA_CHALLENGE;
const ttl = isSuccess ? '15m' : '5m';

const token = await this.jwtService.sign(userId, type, ttl);`,
    },
    {
      label: 'MFA setup. Two-phase with aggregate-raised events',
      code: `// Phase 1: SetupMfaHandler stores secret, MFA stays disabled
const secret = this.totpService.generateSecret();
user.setMfaSecret(secret);
await this.userRepository.save(user);

// Phase 2: VerifyMfaSetupHandler verifies code, enables MFA
const isValid = this.totpService.verify(user.mfaSecret, command.totpCode);
if (!isValid) return Result.fail(new InvalidMfaCodeException());

user.confirmMfa(); // raises MfaEnabledEvent
await this.userRepository.save(user);
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);`,
    },
    {
      label: 'User aggregate. MFA state transitions own their events',
      code: `class User extends AggregateRoot {
  loggedIn(): void {
    this.addDomainEvent(new UserLoggedInEvent(this._id.value));
  }

  setMfaSecret(secret: string): void {
    this._mfaSecret = secret;
  }

  confirmMfa(): void {
    if (!this._mfaSecret) return;
    this._mfaEnabled = true;
    this.addDomainEvent(new MfaEnabledEvent(this._id.value));
  }

  disableMfa(): void {
    if (!this._mfaEnabled) return;
    this._mfaEnabled = false;
    this._mfaSecret = undefined;
    this.addDomainEvent(new MfaDisabledEvent(this._id.value));
  }
}`,
    },
    {
      label: 'Challenge token flow. sessionStorage on the client',
      code: `// Login action. Both DTO types use a .token field
const response = await identityService.loginUser(email, password);

if (response.type === 'SUCCESS') {
  await setCookie(response.token);
  return;
}
return { challengeToken: response.token };

// useLoginForm hook. Redirect to MFA page
onSuccess: (result) => {
  if (result?.challengeToken) {
    sessionStorage.setItem('mfa_challenge', result.challengeToken);
    router.push(ROUTES.mfa);
    return;
  }
  router.push(ROUTES.overview);
}

// useMfaVerifyForm hook. Read at submit time, redirect on invalid
const challengeToken = sessionStorage.getItem('mfa_challenge');
if (!challengeToken) { router.replace(ROUTES.login); return; }`,
    },
  ],
};

export { mfa };
