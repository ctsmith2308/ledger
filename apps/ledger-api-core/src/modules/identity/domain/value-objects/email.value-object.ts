import { ValueObject } from '@/shared/domain/value-object';
import { Result } from '@/shared/domain/result';
import { InvalidEmailException } from '@/modules/identity/domain/exceptions';

interface EmailProps {
  value: string;
}

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

  private static isValid(email: string): boolean {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isValid;
  }

  get address(): string {
    return this.props.value;
  }

  public static from(address: string): Email {
    return new Email({ value: address });
  }
}

export { type EmailProps, Email };
