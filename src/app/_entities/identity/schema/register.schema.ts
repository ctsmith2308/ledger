import { z } from 'zod';

import {
  emailField,
  passwordField,
  firstNameField,
  lastNameField,
} from './fields';

const registerUserSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  email: emailField,
  password: passwordField,
});

type RegisterUserInput = z.infer<typeof registerUserSchema>;

export { registerUserSchema, type RegisterUserInput };
