import { z } from 'zod';

const registerUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required.')
    .max(30, 'First name must be at most 30 characters.'),
  lastName: z
    .string()
    .min(1, 'Last name is required.')
    .max(30, 'Last name must be at most 30 characters.'),
  email: z
    .string()
    .min(5, 'Email must be at least 5 characters.')
    .max(32, 'Email must be at most 32 characters.'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters.')
    .max(100, 'Password must be at most 100 characters.'),
});

type RegisterUserInput = z.infer<typeof registerUserSchema>;

export { registerUserSchema, type RegisterUserInput };
