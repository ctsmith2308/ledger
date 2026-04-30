import {
  Result,
  ValueObject,
  InvalidEmailException,
} from '@/core/shared/domain';

interface EmailProps {
  value: string;
}

/**
 * Email value object with two factory methods:
 * - create() trims, validates, and lowercases. Used for user input where
 *   normalization is required for uniqueness.
 * - from() wraps a raw string with no validation. Used for database
 *   reconstitution where the value is already normalized. Do not use
 *   from() with untrusted input.
 */
class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Result<Email, InvalidEmailException> {
    const trimmedEmail = (email ?? '').trim();

    if (!Email.isValid(trimmedEmail)) {
      return Result.fail(new InvalidEmailException());
    }

    const emailInstance = new Email({
      value: trimmedEmail.toLowerCase(),
    });

    return Result.ok(emailInstance);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(email: string): boolean {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isValid;
  }

  public static from(address: string): Email {
    return new Email({ value: address });
  }
}

export { Email, type EmailProps };
