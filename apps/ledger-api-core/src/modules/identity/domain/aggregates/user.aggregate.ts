import { v4 as uuid } from 'uuid';

import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { Email, Password } from '@/modules/identity/domain';
// import { UserRegisteredEvent } from '../events/user-registered.event';

class User extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private _passwordHash: Password,
    private _mfaEnabled: boolean = false,
    private _mfaSecret?: string,
  ) {
    super();
  }

  static register(email: Email, passwordHash: Password): User {
    const id = uuid();
    const user = new User(id, email, passwordHash);

    user.addDomainEvent(new UserRegisteredEvent(id, email));

    return user;
  }

  enableMfa(secret: string): void {
    this._mfaSecret = secret;
    this._mfaEnabled = true;
  }

  static reconstitute(
    id: string,
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
