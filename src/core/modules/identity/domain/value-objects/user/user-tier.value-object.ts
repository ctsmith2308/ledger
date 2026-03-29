import {
  Result,
  ValueObject,
  InvalidTierException,
} from '@/core/shared/domain';

const USER_TIERS = {
  DEMO: 'DEMO',
  TRIAL: 'TRIAL',
  FULL: 'FULL',
} as const;

type UserTierValue = (typeof USER_TIERS)[keyof typeof USER_TIERS];

const VALID_TIERS = new Set<string>(Object.values(USER_TIERS));

interface UserTierProps {
  value: UserTierValue;
}

class UserTier extends ValueObject<UserTierProps> {
  private constructor(props: UserTierProps) {
    super(props);
  }

  static create(
    tier: string,
  ): Result<UserTier, InvalidTierException> {
    if (!VALID_TIERS.has(tier)) {
      return Result.fail(new InvalidTierException());
    }

    return Result.ok(new UserTier({ value: tier as UserTierValue }));
  }

  static from(tier: string): UserTier {
    return new UserTier({ value: tier as UserTierValue });
  }

  get value(): UserTierValue {
    return this.props.value;
  }

  get isDemo(): boolean {
    return this.props.value === USER_TIERS.DEMO;
  }

  get isTrial(): boolean {
    return this.props.value === USER_TIERS.TRIAL;
  }
}

export { UserTier, USER_TIERS, type UserTierValue, type UserTierProps };
