interface IPasswordHasher {
  hash(password: string): Promise<string>;
}

const PASSWORD_HASHER = Symbol('IPasswordHasher');

export { type IPasswordHasher, PASSWORD_HASHER };
