import { IdentityModule } from './modules/identity/indentity.module';

const coreApi = {
  identity: IdentityModule(),
};

export { coreApi };

export * from './modules/identity/indentity.module';
