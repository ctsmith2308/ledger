import { AggregateRoot } from '@/core/shared/domain';

import { UserId, FirstName, LastName } from '../value-objects';

import { UserProfileUpdatedEvent } from '../events';

class UserProfile extends AggregateRoot {
  private constructor(
    private readonly _id: UserId,
    private _firstName: FirstName,
    private _lastName: LastName,
  ) {
    super();
  }

  static save(
    id: UserId,
    firstName: FirstName,
    lastName: LastName,
  ): UserProfile {
    const profile = new UserProfile(id, firstName, lastName);

    profile.addDomainEvent(new UserProfileUpdatedEvent(id.value));

    return profile;
  }

  static reconstitute(
    id: UserId,
    firstName: FirstName,
    lastName: LastName,
  ): UserProfile {
    return new UserProfile(id, firstName, lastName);
  }

  updateName(firstName: FirstName, lastName: LastName): void {
    this._firstName = firstName;
    this._lastName = lastName;

    this.addDomainEvent(new UserProfileUpdatedEvent(this._id.value));
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
