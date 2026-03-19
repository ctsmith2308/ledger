// import { Prisma } from '@generated/prisma/client';
import { ZodError } from 'zod';

import { DomainException } from '../../domain';

type NormalizedError = {
  code: string;
  message: string;
};

const domainTypeMap: Record<string, NormalizedError> = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
  LOGIN_FAILED: {
    code: 'UNAUTHORIZED',
    message: "The details you've entered don't match our records.",
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this resource.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid data.',
  },
  INVALID_EMAIL: {
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid data.',
  },
  INVALID_PASSWORD: {
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid data.',
  },
  INVALID_USER_ID: {
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid data.',
  },
  CONFLICT: { code: 'CONFLICT', message: 'Resource already exists.' },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.' },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal Server Error',
  },
};

const mapError = (error: unknown): NormalizedError => {
  if (error instanceof DomainException) {
    return domainTypeMap[error.type] ?? domainTypeMap.SERVER_ERROR;
  }

  if (error instanceof ZodError) {
    return domainTypeMap.VALIDATION_ERROR;
  }

  // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }

  return domainTypeMap.SERVER_ERROR;
};

export { mapError };
export type { NormalizedError };
