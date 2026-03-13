import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

/**
 * Reference:
 * Saved my bacon a CF, super helpful!
 * https://papooch.github.io/nestjs-cls/features-and-use-cases/request-id
 */
const correlationIdGenerator = (req: Request): string => {
  const header = req.headers['x-correlation-id'];
  if (Array.isArray(header)) return header[0];
  return header ?? uuidv4();
};

export { correlationIdGenerator };
