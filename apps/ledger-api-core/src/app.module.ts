import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CqrsModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
