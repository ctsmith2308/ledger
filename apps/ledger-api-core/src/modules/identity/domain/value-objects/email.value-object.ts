import { ValueObject } from '@/shared/domain/value-object';
import { InvalidEmailException } from '@/modules/identity/domain/exceptions';

interface EmailProps {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Email {
    const trimmedEmail = email.trim();

    if (!this.isValid(trimmedEmail)) {
      throw new InvalidEmailException();
    }

    return new Email({ value: trimmedEmail.toLowerCase() });
  }

  private static isValid(email: string): boolean {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isValid;
  }

  get value(): string {
    return this.props.value;
  }

  public static fromValue(value: string): Email {
    return new Email({ value });
  }
}

export { type EmailProps, Email };
