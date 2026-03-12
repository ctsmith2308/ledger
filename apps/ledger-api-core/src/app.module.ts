import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@/shared/infrastructure/persistence';

import { AppController } from './app.controller';
import { IdentityModule } from '@/modules/identity/identity.module';

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule, IdentityModule],
  controllers: [AppController],
})
class AppModule {}

export { AppModule };
