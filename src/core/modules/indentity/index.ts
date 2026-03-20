// Importing identity.module triggers all handler registrations
import './identity.module';

export { commandBus, queryBus } from '@/core/shared/infrastructure';
export * from './application/commands/login-user';
export * from './application/commands/register-user';
export * from './application/queries/get-user-profile';
export * from './application/schema';
