abstract class DomainException extends Error {
  public readonly code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { DomainException };
