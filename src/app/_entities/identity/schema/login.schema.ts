import { z } from 'zod';

import { emailField, passwordField } from './fields';

const loginUserSchema = z.object({
  email: emailField,
  password: passwordField,
});

type LoginUserInput = z.infer<typeof loginUserSchema>;

export { loginUserSchema, type LoginUserInput };
