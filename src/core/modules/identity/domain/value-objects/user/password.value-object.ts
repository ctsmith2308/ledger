import {
  Result,
  ValueObject,
  InvalidPasswordException,
} from '@/core/shared/domain';

interface PasswordProps {
  value: string;
}

/**
 * Password value object with two factory methods:
 * - create() validates plaintext against business rules (special char + number)
 *   and returns Result. Used for user input at registration and login.
 * - fromHash() bypasses validation and wraps a pre-hashed string. Used when
 *   reconstituting from the database. The hash cannot be validated against
 *   plaintext rules.
 *
 * The content getter returns the raw value regardless of which factory
 * created it. Callers must know whether they hold plaintext or a hash.
 */
class Password extends ValueObject<PasswordProps> {
  private constructor(props: { value: string }) {
    super(props);
  }

  public static create(
    plainText: string,
  ): Result<Password, InvalidPasswordException> {
    if (!Password.hasSpecial(plainText)) {
      return Result.fail(new InvalidPasswordException());
    }

    if (!Password.hasNumber(plainText)) {
      return Result.fail(new InvalidPasswordException());
    }

    const passwordInstance = new Password({ value: plainText });

    return Result.ok(passwordInstance);
  }

  /** Must contain a special character. */
  private static hasSpecial(plainText: string) {
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(plainText);
    return hasSpecial;
  }

  /** Must contain a number. */
  private static hasNumber(plainText: string) {
    const hasNumber = /\d/.test(plainText);
    return hasNumber;
  }

  /** Reconstitute from a stored hash. Bypasses validation. */
  static fromHash(hash: string): Password {
    return new Password({ value: hash });
  }

  get content(): string {
    return this.props.value;
  }
}

export { Password, type PasswordProps };
