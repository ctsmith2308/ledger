import { ValueObject } from '@/shared/domain';

import { WeakPasswordException } from '@/modules/identity/domain/exceptions';

interface PasswordProps {
  value: string;
}

class Password extends ValueObject<PasswordProps> {
  private constructor(props: { value: string }) {
    super(props);
  }

  public static create(plainText: string): Password {
    // BUSINESS RULE: Must contain a special character
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(plainText);

    if (!hasSpecial) {
      throw new WeakPasswordException(
        'Password must contain a special character',
      );
    }

    // // BUSINESS RULE: Must contain a number
    const hasNumber = /\d/.test(plainText);
    if (!hasNumber) {
      throw new WeakPasswordException(
        'Password must contain at least one number',
      );
    }

    return new Password({ value: plainText });
  }

  // Use this when creating from a HASH (e.g., from DB or after hashing)
  static fromHash(hash: string): Password {
    return new Password({ value: hash });
  }

  get value(): string {
    return this.props.value;
  }
}

export { Password };
