import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { type ClsModuleOptions, ClsModule } from 'nestjs-cls';
import { correlationIdGenerator } from '@/shared/infrastructure/utils';
import { PrismaModule } from '@/shared/infrastructure/persistence';
import { AppLogger } from '@/shared/infrastructure/logging';
import {
  AllExceptionsFilter,
  DomainExceptionFilter,
  PrismaExceptionFilter,
} from '@/shared/infrastructure/filters';

/**
 * Reference:
 * Global Exception Filter providing, see APP_FILTER
 * https://docs.nestjs.com/exception-filters#exception-filters-1
 *
 * Gotcha!
 * Filters MUST be registered using the 'APP_FILTER' token to be active globally.
 * Simply adding the class to 'providers' will only register it as a
 * standard injectable service and it will NOT catch exceptions.
 */
const appFilterProviders = [
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  {
    provide: APP_FILTER,
    useClass: DomainExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: PrismaExceptionFilter,
  },
];

/**
 * Reference:
 * Middleware for intercepting requests to hydrate or grab data.
 * https://papooch.github.io/nestjs-cls/setting-up-cls-context#async
 */
const clsModuleOpts: ClsModuleOptions = {
  global: true,
  middleware: {
    mount: true,
    generateId: true,
    idGenerator: correlationIdGenerator,
  },
};

@Global()
@Module({
  imports: [
    CqrsModule.forRoot(),
    ClsModule.forRoot(clsModuleOpts),
    PrismaModule,
  ],
  providers: [AppLogger, ...appFilterProviders],
  exports: [ClsModule, CqrsModule],
})
class SharedInfrastructureModule {}

export { SharedInfrastructureModule };
