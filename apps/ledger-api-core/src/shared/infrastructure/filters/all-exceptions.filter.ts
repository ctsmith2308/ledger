import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { AppLogger } from '@/shared/infrastructure/logging/app-logger';

/**
 * Reference:
 * Prisma provides global exception filters that act as wrappers to catch unexpected exceptions - neato!
 * https://docs.nestjs.com/exception-filters#exception-filters
 */
@Catch() // Empty decorator catches EVERYTHING
class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(
    adapterHost: HttpAdapterHost,
    private readonly logger: AppLogger,
  ) {
    super(adapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // 1. Narrow the type to get a safe stack string
    const stack =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(
      `UNEXPECTED_ERROR ${request.method} ${request.url}`,
      stack,
      'AllExceptionsFilter',
    );

    super.catch(exception, host);
  }
}

export { AllExceptionsFilter };
