import { z } from 'zod';

import { ZodValidator } from '@/core/shared/infrastructure/services/zod-validator.service';

import { RegisterUserCommand } from '../commands/register-user.command';

const registerUserValidator = new ZodValidator<RegisterUserCommand>(
  z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
);

export { registerUserValidator };
