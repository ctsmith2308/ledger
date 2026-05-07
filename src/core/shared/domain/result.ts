/**
 * Monadic result type for domain operations. Encodes success/failure as
 * a value rather than throwing, so every failure path is typed and visible.
 *
 * getValueOrThrow() is the bridge to the transport layer. Services call
 * it to unwrap the result; on failure, the underlying DomainException
 * throws and is caught by handleServerError in the action client.
 *
 * Frozen on construction so results cannot be mutated after creation.
 */
class Result<T, E extends Error> {
  private constructor(
    public readonly status: 'SUCCESS' | 'FAIL',
    private readonly _error?: E,
    private readonly _value?: T,
  ) {
    Object.freeze(this);
  }

  public get value(): T {
    if (this.status === 'FAIL') {
      throw new Error("Can't get the value of a failure result.");
    }

    return this._value as T;
  }

  public get error(): E {
    if (this.status === 'SUCCESS') {
      throw new Error("Can't get the error of a success result.");
    }
    return this._error as E;
  }

  public get isSuccess(): boolean {
    return this.status === 'SUCCESS';
  }

  public get isFailure(): boolean {
    return this.status === 'FAIL';
  }

  public getValueOrThrow(): T {
    if (this.status === 'FAIL') {
      throw this._error;
    }
    return this._value as T;
  }

  /** Uses 'never' for the unused side so callers can't accidentally access it. */
  public static ok<T, E extends Error = never>(value: T): Result<T, E> {
    return new Result<T, E>('SUCCESS', undefined, value);
  }

  public static fail<E extends Error, T = never>(error: E): Result<T, E> {
    return new Result<T, E>('FAIL', error, undefined);
  }
}

export { Result };
