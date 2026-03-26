import { z } from 'zod';

const createBudgetFormSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  monthlyLimit: z.string().min(1, 'Monthly limit is required.'),
});

type CreateBudgetFormInput = z.infer<typeof createBudgetFormSchema>;

export { createBudgetFormSchema, type CreateBudgetFormInput };
