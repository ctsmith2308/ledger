import { AggregateRoot } from '@/core/shared/domain';
import { UserId, FirstName, LastName } from '../value-objects';

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
    return new UserProfile(id, firstName, lastName);
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
