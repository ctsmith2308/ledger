import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { IdentityController } from '@/modules/identity/api';

// Providers
import {
  IdentityApplicationProviders,
  IdentityInfrastructureProviders,
} from '@/modules/identity/identity.providers';

@Module({
  imports: [CqrsModule],
  controllers: [IdentityController],
  providers: [
    ...IdentityApplicationProviders,
    ...IdentityInfrastructureProviders,
  ],
})
class IdentityModule {}

export { IdentityModule };
