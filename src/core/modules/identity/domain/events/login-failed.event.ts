import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class LoginFailedEvent extends DomainEvent {
  readonly email: string;
  readonly reason: string;

  constructor(email: string, reason: string) {
    super(email, IdentityEvents.LOGIN_FAILED);
    this.email = email;
    this.reason = reason;
  }
}

export { LoginFailedEvent };
