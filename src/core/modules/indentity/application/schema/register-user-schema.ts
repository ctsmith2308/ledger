import { z } from 'zod';
import { RegisterUserCommand } from '../commands/register-user.command';
import { ZodValidator } from '@/core/shared/infrastructure/services/zod-validator.service';

const schema: z.ZodSchema<RegisterUserCommand> = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const RegisterUserValidator = () => new ZodValidator<RegisterUserCommand>(schema);

export { RegisterUserValidator };
