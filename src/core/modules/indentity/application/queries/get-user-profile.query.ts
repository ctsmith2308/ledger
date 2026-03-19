import { Result } from '@/core/shared/domain';
import { DomainException } from '@/core/shared/domain/exceptions';
import { User } from '../../domain/aggregates';

type GetUserProfileResponse = Result<User, DomainException>;

interface GetUserProfileQuery {
  readonly jwt: string;
}

export type { GetUserProfileQuery, GetUserProfileResponse };
