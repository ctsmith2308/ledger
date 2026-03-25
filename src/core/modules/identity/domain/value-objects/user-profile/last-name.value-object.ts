import { Result, ValueObject } from '@/core/shared/domain';

interface LastNameProps {
  value: string;
}

class LastName extends ValueObject<LastNameProps> {
  private constructor(props: LastNameProps) {
    super(props);
  }

  public static create(lastName: string): Result<LastName, Error> {
    const trimmed = (lastName ?? '').trim();

    if (trimmed.length === 0) return Result.fail(new Error('Last name is required.'));
    if (trimmed.length > 30) return Result.fail(new Error('Last name must be at most 30 characters.'));

    return Result.ok(new LastName({ value: trimmed }));
  }

  public static from(lastName: string) {
    return new LastName({ value: lastName });
  }

  get value(): string {
    return this.props.value;
  }
}

export { LastName };
