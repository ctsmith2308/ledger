import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';
import { InvalidUserIdException } from '@/modules/identity/domain/exceptions';

interface UserIdProps {
  value: string;
}

class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  public static create(id: string): Result<UserId, InvalidUserIdException> {
    if (!id || id.length < 5) {
      return Result.fail(new InvalidUserIdException());
    }

    return Result.ok(new UserId({ value: id }));
  }

  public static from(id: string): UserId {
    return new UserId({ value: id });
  }

  get value(): string {
    return this.props.value;
  }
}

export { type UserIdProps, UserId };
