import { AggregateRoot } from '@/core/shared/domain';
import { UserId, Email, Password, UserTier, USER_TIERS } from '../value-objects';
import { UserRegisteredEvent } from '../events';

class User extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _passwordHash: Password,
    private readonly _tier: UserTier,
    private _mfaEnabled: boolean = false,
    private _mfaSecret?: string,
  ) {
    super();
  }

  static register(id: UserId, email: Email, passwordHash: Password): User {
    const tier = UserTier.from(USER_TIERS.TRIAL);
    const user = new User(id, email, passwordHash, tier);

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
    tier: UserTier,
    mfaEnabled: boolean,
    mfaSecret?: string,
  ): User {
    return new User(id, email, passwordHash, tier, mfaEnabled, mfaSecret);
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

  get tier() {
    return this._tier;
  }

  get mfaEnabled() {
    return this._mfaEnabled;
  }

  get mfaSecret() {
    return this._mfaSecret;
  }
}

export { User };
