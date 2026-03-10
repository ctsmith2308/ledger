import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { IdentityController } from '@/modules/identity/api';
import { RegisterUserHandler } from '@/modules/identity/cqrs';

const CommandHandlers = [RegisterUserHandler];

@Module({
  imports: [CqrsModule],
  controllers: [IdentityController],
  providers: [...CommandHandlers],
})
class IdentityModule {}

export { IdentityModule };
