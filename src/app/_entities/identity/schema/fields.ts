import { z } from 'zod';

const emailField = z
  .string()
  .min(5, 'Email must be at least 5 characters.')
  .max(32, 'Email must be at most 32 characters.');

const passwordField = z
  .string()
  .min(10, 'Password must be at least 10 characters.')
  .max(100, 'Password must be at most 100 characters.');

const firstNameField = z
  .string()
  .min(1, 'First name is required.')
  .max(30, 'First name must be at most 30 characters.');

const lastNameField = z
  .string()
  .min(1, 'Last name is required.')
  .max(30, 'Last name must be at most 30 characters.');

export { emailField, passwordField, firstNameField, lastNameField };
