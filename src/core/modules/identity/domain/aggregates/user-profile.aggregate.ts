import { AggregateRoot } from '@/core/shared/domain';
import { UserId, FirstName, LastName } from '../value-objects';
// import { UserRegisteredEvent } from '../events';

class UserProfile extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private readonly _firstName: FirstName,
    private readonly _lastName: LastName,
  ) {
    super();
  }

  static save(
    id: UserId,
    firstName: FirstName,
    lastName: LastName,
  ): UserProfile {
    const user = new UserProfile(id, firstName, lastName);

    // user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));

    return user;
  }

  static reconstitute(
    id: UserId,
    firstName: FirstName,
    lastName: LastName,
  ): UserProfile {
    return new UserProfile(id, firstName, lastName);
  }

  get id() {
    return this._id;
  }

  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
  }
}

export { UserProfile };
