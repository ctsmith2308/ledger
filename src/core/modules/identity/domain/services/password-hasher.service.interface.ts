interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(hashedPassword: string, password: string): Promise<boolean>;
}

export { type IPasswordHasher };
