// import { Prisma } from '@generated/prisma/client';
import { DomainException } from '../../domain';

type HttpErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'UNEXPECTED_ERROR'
  | 'SERVER_ERROR'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'INVALID_ID';

type HttpErrorStatus = 400 | 401 | 403 | 404 | 409 | 500;

class HttpErrorResponse extends Error {
  constructor(
    public readonly status: HttpErrorStatus,
    public readonly code: HttpErrorCode,
    public readonly error: string, // The human-readable message
  ) {
    super(error);
    Object.setPrototypeOf(this, HttpErrorResponse.prototype);
  }

  toResponse() {
    return {
      code: this.code,
      message: this.error,
    };
  }
}

interface HttpErrorData {
  status: HttpErrorStatus;
  code: HttpErrorCode;
  error: string;
}

const DomainExceptionToHttpMap: Record<string, HttpErrorData> = {
  UNAUTHORIZED: {
    status: 401,
    code: 'UNAUTHORIZED',
    error: 'Authentication required.',
  },
  LOGIN_FAILED: {
    status: 401,
    code: 'UNAUTHORIZED',
    error: "The details you've entered don't match our records.",
  },
  FORBIDDEN: {
    status: 403,
    code: 'FORBIDDEN',
    error: 'You do not have permission to access this resource.',
  },
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    error: 'The request contains invalid data.',
  },
  UNEXPECTED_ERROR: {
    status: 400,
    code: 'UNEXPECTED_ERROR',
    error: 'An unexpected error occurred with your request.',
  },
  SERVER_ERROR: {
    status: 500,
    code: 'SERVER_ERROR',
    error: 'Internal Server Error',
  },
};

const toErrorMap = (error: unknown): HttpErrorResponse => {
  if (error instanceof DomainException) {
    const data =
      DomainExceptionToHttpMap[error.type] ??
      DomainExceptionToHttpMap.SERVER_ERROR;
    return new HttpErrorResponse(data.status, data.code, data.error);
  }

  // if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //   return new HttpErrorResponse(500, 'SERVER_ERROR', 'Internal Server Error');
  // }

  return new HttpErrorResponse(500, 'SERVER_ERROR', 'Internal Server Error');
};

export { toErrorMap, HttpErrorResponse };
export type { HttpErrorCode, HttpErrorStatus };
