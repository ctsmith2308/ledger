import { z } from 'zod';

const registerUserSchema = z.object({
  email: z
    .string()
    .min(5, 'Email must be at least 5 characters.')
    .max(32, 'Email must be at most 32 characters.'),
  password: z
    .string()
    .min(20, 'Password must be at least 20 characters.')
    .max(100, 'Password must be at most 100 characters.'),
});

type RegisterUserInput = z.infer<typeof registerUserSchema>;

export { registerUserSchema, type RegisterUserInput };
