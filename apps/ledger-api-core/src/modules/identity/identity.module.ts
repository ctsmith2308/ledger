import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { IdentityController } from '@/modules/identity/api';

// Commands/Queries
import { CommandHandlers } from '@/modules/identity/application';

// Providers
import { PersistenceProviders } from '@/modules/identity/indentity.providers';

@Module({
  imports: [CqrsModule],
  controllers: [IdentityController],
  providers: [...CommandHandlers, ...PersistenceProviders],
})
class IdentityModule {}

export { IdentityModule };
