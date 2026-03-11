/**
 * Important!
 * Since this will be injected, be sure to provide to module definition
 * see: @/modules/identity/identity.providers.ts
 */

interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

const PASSWORD_HASHER = Symbol('IPasswordHasher');

export { type IPasswordHasher, PASSWORD_HASHER };
