import { Result, ValueObject, InvalidSessionIdException } from '@/core/shared/domain';

interface SessionIdProps {
  value: string;
}

class SessionId extends ValueObject<SessionIdProps> {
  private constructor(props: SessionIdProps) {
    super(props);
  }

  static create(id: string): Result<SessionId, InvalidSessionIdException> {
    if (!id || id.trim().length === 0) {
      return Result.fail(new InvalidSessionIdException());
    }

    return Result.ok(new SessionId({ value: id }));
  }

  static from(id: string): SessionId {
    return new SessionId({ value: id });
  }

  get value(): string {
    return this.props.value;
  }
}

export { SessionId };
