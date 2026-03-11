import { ValueObject } from '@/shared/domain';
import { Result } from '@/shared/domain/result';
import { InvalidPasswordException } from '@/modules/identity/domain/exceptions';

interface PasswordProps {
  value: string;
}

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

  // BUSINESS RULE: Must contain a special character
  private static hasSpecial(plainText: string) {
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(plainText);
    return hasSpecial;
  }

  // BUSINESS RULE: Must contain a number
  private static hasNumber(plainText: string) {
    const hasNumber = /\d/.test(plainText);
    return hasNumber;
  }

  // Use this when creating from a HASH (e.g., from DB or after hashing)
  static fromHash(hash: string): Password {
    return new Password({ value: hash });
  }

  get content(): string {
    return this.props.value;
  }
}

export { Password };
