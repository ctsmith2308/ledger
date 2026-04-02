import { ZodError } from 'zod';
import { Prisma } from '@generated-prisma/client';

import { DomainException, ERROR_CODES } from '../../domain';

type ErrorResponse = {
  code: string;
  message: string;
};

const domainTypeMap = new Map<string, ErrorResponse>([
  ['UNAUTHORIZED', { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required.' }],
  ['SESSION_EXPIRED', { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required.' }],
  ['SESSION_REVOKED', { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required.' }],
  ['INVALID_SESSION_ID', { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required.' }],
  ['RATE_LIMIT_EXCEEDED', { code: ERROR_CODES.RATE_LIMIT_EXCEEDED, message: 'Too many requests.' }],
  ['LOGIN_FAILED', { code: ERROR_CODES.UNAUTHORIZED, message: "The details you've entered don't match our records." }],
  ['FORBIDDEN', { code: ERROR_CODES.FORBIDDEN, message: 'You do not have permission to access this resource.' }],
  ['VALIDATION_ERROR', { code: ERROR_CODES.VALIDATION_ERROR, message: 'The request contains invalid data.' }],
  ['INVALID_EMAIL', { code: ERROR_CODES.VALIDATION_ERROR, message: 'The request contains invalid data.' }],
  ['INVALID_PASSWORD', { code: ERROR_CODES.VALIDATION_ERROR, message: 'The request contains invalid data.' }],
  ['INVALID_USER_ID', { code: ERROR_CODES.VALIDATION_ERROR, message: 'The request contains invalid data.' }],
  ['BUDGET_ALREADY_EXISTS', { code: ERROR_CODES.CONFLICT, message: 'A budget for this category already exists.' }],
  ['CONFLICT', { code: ERROR_CODES.CONFLICT, message: 'Resource already exists.' }],
  ['NOT_FOUND', { code: ERROR_CODES.NOT_FOUND, message: 'Resource not found.' }],
  ['USER_NOT_FOUND', { code: ERROR_CODES.NOT_FOUND, message: 'Resource not found.' }],
  ['ACCOUNT_NOT_FOUND', { code: ERROR_CODES.NOT_FOUND, message: 'Resource not found.' }],
  ['BUDGET_NOT_FOUND', { code: ERROR_CODES.NOT_FOUND, message: 'Resource not found.' }],
  ['PLAID_ERROR', { code: ERROR_CODES.PLAID_ERROR, message: 'A banking service error occurred.' }],
  ['INVALID_AMOUNT', { code: ERROR_CODES.VALIDATION_ERROR, message: 'The request contains invalid data.' }],
  ['DEMO_RESTRICTED', { code: ERROR_CODES.DEMO_RESTRICTED, message: 'This action is not available for demo accounts.' }],
  ['FEATURE_DISABLED', { code: ERROR_CODES.FEATURE_DISABLED, message: 'This feature is not available for your account tier.' }],
  ['SERVER_ERROR', { code: ERROR_CODES.SERVER_ERROR, message: 'Internal Server Error' }],
]);

const SERVER_ERROR = domainTypeMap.get('SERVER_ERROR')!;

// https://www.prisma.io/docs/orm/reference/error-reference#error-codes
const prismaErrorMap = new Map<string, ErrorResponse>([
  ['P2002', domainTypeMap.get('CONFLICT')!],
  ['P2025', domainTypeMap.get('NOT_FOUND')!],
  ['P2003', domainTypeMap.get('CONFLICT')!],
]);

const toErrorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof DomainException) {
    return domainTypeMap.get(error.type) ?? SERVER_ERROR;
  }

  if (error instanceof ZodError) {
    return domainTypeMap.get('VALIDATION_ERROR')!;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return prismaErrorMap.get(error.code) ?? SERVER_ERROR;
  }

  return SERVER_ERROR;
};

export { toErrorResponse, type ErrorResponse };
