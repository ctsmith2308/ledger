import { RegisterUserHandler } from './register-user/register-user.handler';

// Export the individual commands so the Controller can use them
export * from './register-user/register-user.command';

// Export the array for the NestJS Module providers
export const CommandHandlers = [RegisterUserHandler];
