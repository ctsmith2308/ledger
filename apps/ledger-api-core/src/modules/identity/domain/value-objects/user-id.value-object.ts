import { ValueObject } from '@/shared/domain/value-object';

interface UserIdProps {
  value: string;
}

class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  public static create(id: string): UserId {
    if (!id || id.length < 5) throw new Error('Invalid User ID format');

    return new UserId({ value: id });
  }

  get value(): string {
    return this.props.value;
  }
}

export { type UserIdProps, UserId };
