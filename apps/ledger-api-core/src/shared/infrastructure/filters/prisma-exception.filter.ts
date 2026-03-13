import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@generated/prisma/client';
import { Request, Response } from 'express';
import { AppLogger } from '@/shared/infrastructure/logging';

/**
 * Reference:
 * Prisma provides global exception filters that act as wrappers to catch unexpected exceptions - neato!
 * https://docs.nestjs.com/exception-filters#exception-filters
 */
@Catch(Prisma.PrismaClientKnownRequestError)
class PrismaExceptionFilter extends BaseExceptionFilter {
  constructor(
    adapterHost: HttpAdapterHost,
    private readonly logger: AppLogger,
  ) {
    super(adapterHost.httpAdapter);
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `[${exception.code}] ${request.method} ${request.url}`,
      exception.stack,
    );

    const mapping = this.getSafeMapping(exception.code);
    if (mapping) {
      response.status(mapping.status).json({
        statusCode: mapping.status,
        message: mapping.message,
        code: mapping.code,
      });
      return;
    }

    // Fallback for all other unknows
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      code: 'DATABASE_EXCEPTION',
    });
  }

  /**
   * Reference:
   * Prisma Error Types: https://www.prisma.io/docs/orm/reference/error-reference
   */
  private getSafeMapping(code: string) {
    const map: Record<
      string,
      { status: number; message: string; code: string }
    > = {
      P2002: {
        status: 409,
        message: 'Resource already exists',
        code: 'CONFLICT',
      },
      P2025: { status: 404, message: 'Resource not found', code: 'NOT_FOUND' },
      P2003: {
        status: 400,
        message: 'Invalid reference provided',
        code: 'INVALID_ID',
      },
    };
    return map[code];
  }
}

export { PrismaExceptionFilter };
