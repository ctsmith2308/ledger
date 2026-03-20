import { queryBus } from '@/core/shared/infrastructure';
import { GetUserProfileQuery } from './get-user-profile.query';
import { GetUserProfileHandler } from './get-user-profile.handler';

queryBus.register(GetUserProfileQuery, new GetUserProfileHandler());

export { GetUserProfileQuery };
export type { GetUserProfileResponse } from './get-user-profile.query';
