import { z } from 'zod';

const exchangePublicTokenSchema = z.object({
  publicToken: z.string().min(1, 'Public token is required.'),
});

type ExchangePublicTokenInput = z.infer<typeof exchangePublicTokenSchema>;

export { exchangePublicTokenSchema, type ExchangePublicTokenInput };
