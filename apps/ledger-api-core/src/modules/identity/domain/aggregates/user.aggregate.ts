import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { Email } from '@/modules/identity/domain';
// import { UserRegisteredEvent } from '../events/user-registered.event';

class User extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private _passwordHash: string,
    private _mfaEnabled: boolean = false,
    private _mfaSecret?: string,
  ) {
    super();
  }

  static register(id: string, email: string, passwordHash: string): User {
    const user = new User(id, new Email(email), passwordHash);

    // user.addDomainEvent(new UserRegisteredEvent(id, email));

    return user;
  }

  enableMfa(secret: string): void {
    this._mfaSecret = secret;
    this._mfaEnabled = true;
  }

  get id() {
    return this._id;
  }

  get email() {
    return this._email.value;
  }

  get mfaEnabled() {
    return this._mfaEnabled;
  }

  get mfaSecret() {
    return this._mfaSecret;
  }
}

export { User };
