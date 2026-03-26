import { z } from 'zod';

const createBudgetSchema = z.object({
  category: z
    .string()
    .min(1, 'Category is required.')
    .max(50, 'Category must be at most 50 characters.'),
  monthlyLimit: z
    .number()
    .positive('Monthly limit must be a positive number.'),
});

type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export { createBudgetSchema, type CreateBudgetInput };
