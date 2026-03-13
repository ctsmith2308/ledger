import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppLogger } from '@/shared/infrastructure/logging';
import { DomainException } from '@/shared/domain';

/**
 * Reference:
 * Prisma provides global exception filters that act as wrappers to catch unexpected exceptions - neato!
 * https://docs.nestjs.com/exception-filters#exception-filters
 */
@Catch()
class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  private readonly errorCodeMap: Record<string, number> = {
    USER_NOT_FOUND: HttpStatus.NOT_FOUND, // 404
    INVALID_EMAIL: HttpStatus.BAD_REQUEST, // 400
    INVALID_PASSWORD: HttpStatus.BAD_REQUEST, // 400
    INVALID_USER_ID: HttpStatus.BAD_REQUEST, // 400
  };

  catch(exception: DomainException, host: ArgumentsHost): void {
    const status = this.errorCodeMap[exception.code] || HttpStatus.BAD_REQUEST;

    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();

    this.logger.error(
      `[${exception.code}] ${status} ${request.method} ${request.url}`,
      exception.stack,
      'DomainExceptionFilter',
    );

    response.status(status).json({
      message: exception.message,
      code: exception.code,
    });
  }
}

export { DomainExceptionFilter };
