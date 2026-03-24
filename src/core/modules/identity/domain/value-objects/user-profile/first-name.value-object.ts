import { Result, ValueObject } from '@/core/shared';

interface FirstNameProps {
  value: string;
}

class FirstName extends ValueObject<FirstNameProps> {
  private constructor(props: FirstNameProps) {
    super(props);
  }

  public static create(firstName: string): Result<FirstName, Error> {
    const trimmed = (firstName ?? '').trim();

    if (trimmed.length === 0) return Result.fail(new Error('First name is required.'));
    if (trimmed.length > 30) return Result.fail(new Error('First name must be at most 30 characters.'));

    return Result.ok(new FirstName({ value: trimmed }));
  }

  public static from(firstName: string): FirstName {
    return new FirstName({ value: firstName });
  }

  get value(): string {
    return this.props.value;
  }
}

export { FirstName };
