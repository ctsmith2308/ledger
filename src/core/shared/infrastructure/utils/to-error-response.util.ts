import { ZodError } from 'zod';
import { Prisma } from '@generated-prisma/client';

import { DomainException } from '../../domain';

type ErrorResponse = {
  code: string;
  message: string;
};

const domainTypeMap: Record<string, ErrorResponse> = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
  SESSION_EXPIRED: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
  SESSION_REVOKED: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
  INVALID_SESSION_ID: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests.',
  },
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
  BUDGET_ALREADY_EXISTS: {
    code: 'CONFLICT',
    message: 'A budget for this category already exists.',
  },
  CONFLICT: { code: 'CONFLICT', message: 'Resource already exists.' },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.' },
  USER_NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.' },
  ACCOUNT_NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.' },
  BUDGET_NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found.' },
  PLAID_ERROR: {
    code: 'PLAID_ERROR',
    message: 'A banking service error occurred.',
  },
  INVALID_AMOUNT: {
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid data.',
  },
  DEMO_RESTRICTED: {
    code: 'DEMO_RESTRICTED',
    message: 'This action is not available for demo accounts.',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal Server Error',
  },
};

// https://www.prisma.io/docs/orm/reference/error-reference#error-codes
const prismaErrorMap: Record<string, ErrorResponse> = {
  P2002: domainTypeMap.CONFLICT, // unique constraint violation
  P2025: domainTypeMap.NOT_FOUND, // record not found
  P2003: domainTypeMap.CONFLICT, // foreign key constraint violation
};

const toErrorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof DomainException) {
    return domainTypeMap[error.type] ?? domainTypeMap.SERVER_ERROR;
  }

  if (error instanceof ZodError) {
    return domainTypeMap.VALIDATION_ERROR;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return prismaErrorMap[error.code] ?? domainTypeMap.SERVER_ERROR;
  }

  return domainTypeMap.SERVER_ERROR;
};

export { toErrorResponse, type ErrorResponse };
