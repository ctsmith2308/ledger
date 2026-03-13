import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

/**
 * Reference:
 * Nest.js provides a built in logger! https://docs.nestjs.com/techniques/logger#logger
 */
@Injectable()
class AppLogger implements LoggerService {
  private logger = new Logger();

  constructor(private readonly cls: ClsService) {}

  private getCorrelationId(): string | undefined {
    return this.cls.getId();
  }

  error(message: string, stack?: string, context?: string) {
    const correlationId = this.getCorrelationId();
    const formattedMessage = `[${correlationId ?? 'SYSTEM'}] ${message}`;

    this.logger.error(formattedMessage, stack, context);
  }

  warn(message: string, context?: string) {
    const correlationId = this.getCorrelationId();

    this.logger.log(`[${correlationId ?? 'SYSTEM'}] ${message}`, context);
  }

  log(message: string, context?: string) {
    const correlationId = this.getCorrelationId();

    this.logger.log(`[${correlationId ?? 'SYSTEM'}] ${message}`, context);
  }
}

export { AppLogger };
