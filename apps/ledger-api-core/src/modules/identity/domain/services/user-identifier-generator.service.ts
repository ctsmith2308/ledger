/**
 * Important!
 * Since this will be injected, be sure to provide to module definition
 * see: @/modules/identity/identity.providers.ts
 */

const ID_GENERATOR = Symbol('ID_GENERATOR');

interface IIdGenerator {
  generate(): string;
}

export { type IIdGenerator, ID_GENERATOR };
