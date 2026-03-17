abstract class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly type: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export { DomainException };
