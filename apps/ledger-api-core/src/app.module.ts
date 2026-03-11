import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaModule } from '@/shared/infrastructure/persistence';

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule],
})
class AppModule {}

export { AppModule };
