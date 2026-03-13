import { Module } from '@nestjs/common';

import { SharedInfrastructureModule } from '@/shared/infrastructure/shared-infrastructre.module';
import { IdentityModule } from '@/modules/identity/identity.module';
import { AppController } from './app.controller';

@Module({
  imports: [SharedInfrastructureModule, IdentityModule],
  controllers: [AppController],
})
class AppModule {}

export { AppModule };
