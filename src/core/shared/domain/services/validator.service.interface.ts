interface IValidator<T> {
  parse(data: unknown): T;
}

export type { IValidator };
