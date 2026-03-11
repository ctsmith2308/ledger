import { AggregateRoot } from '@/shared/domain/aggregate-root';
import {
  Email,
  Password,
  UserId,
  UserRegisteredEvent,
} from '@/modules/identity/domain';

class User extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _passwordHash: Password,
    private _mfaEnabled: boolean = false,
    private _mfaSecret?: string,
  ) {
    super();
  }

  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);

    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));

    return user;
  }

  enableMfa(secret: string): void {
    this._mfaSecret = secret;
    this._mfaEnabled = true;
  }

  static reconstitute(
    id: UserId,
    email: Email,
    passwordHash: Password,
    mfaEnabled: boolean,
    mfaSecret?: string,
  ): User {
    return new User(id, email, passwordHash, mfaEnabled, mfaSecret);
  }

  get id() {
    return this._id;
  }

  get email() {
    return this._email;
  }

  get passwordHash() {
    return this._passwordHash;
  }

  get mfaEnabled() {
    return this._mfaEnabled;
  }

  get mfaSecret() {
    return this._mfaSecret;
  }
}

export { User };
