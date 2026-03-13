class Result<T, E extends Error> {
  public readonly isFailure: boolean;

  private constructor(
    public readonly isSuccess: boolean,
    private readonly _error?: E,
    private readonly _value?: T,
  ) {
    this.isFailure = !isSuccess;

    Object.freeze(this);
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of a failure result.");
    }
    return this._value as T;
  }

  public get error(): E {
    if (this.isSuccess) {
      throw new Error("Can't get the error of a success result.");
    }
    return this._error as E;
  }

  public getValueOrThrow(): T {
    if (this.isFailure) {
      throw this._error!;
    }
    return this._value as T;
  }

  // Use 'never' for the side that isn't present
  public static ok<T, E extends Error = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, undefined, value);
  }

  public static fail<E extends Error, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(false, error, undefined);
  }
}

export { Result };
