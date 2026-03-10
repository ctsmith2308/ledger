import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppController } from './app.controller';
import { PrismaService } from '@/shared/infrastructure/prisma.service';

@Module({
  imports: [CqrsModule.forRoot()],
  controllers: [AppController],
  providers: [PrismaService],
})
class AppModule {}

export { AppModule };
