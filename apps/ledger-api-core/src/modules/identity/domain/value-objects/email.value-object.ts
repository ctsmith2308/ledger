import { ValueObject } from '@/shared/domain/value-object';
import { InvalidEmailException } from '@/modules/identity/domain';

interface EmailProps {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new InvalidEmailException(email);
    }

    return new Email({ value: email.toLowerCase().trim() });
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get value(): string {
    return this.props.value;
  }

  public static fromValue(value: string): Email {
    return new Email({ value });
  }
}

export { type EmailProps, Email };
