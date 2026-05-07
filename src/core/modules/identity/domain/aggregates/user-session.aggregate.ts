// Session record persisted to Postgres on login. The session ID is stored
// in an httpOnly cookie and used as the refresh token. On access token
// expiry, the session is validated via refreshSession() before issuing
// a new access token. Revocation marks revokedAt, blocking future refreshes.

import { AggregateRoot } from '@/core/shared/domain';
import { SessionId, UserId } from '../value-objects';

const SESSION_DURATION_MS =
  Number(process.env.SESSION_DURATION_SECONDS ?? 604800) * 1000;

class UserSession extends AggregateRoot {
  private constructor(
    private readonly _id: SessionId,
    private readonly _userId: UserId,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | undefined,
    private readonly _createdAt: Date,
  ) {
    super();
  }

  static create(id: SessionId, userId: UserId): UserSession {
    const now = new Date();

    const session = new UserSession(
      id,
      userId,
      new Date(now.getTime() + SESSION_DURATION_MS),
      undefined,
      now,
    );

    return session;
  }

  static reconstitute(
    id: SessionId,
    userId: UserId,
    expiresAt: Date,
    revokedAt: Date | undefined,
    createdAt: Date,
  ): UserSession {
    return new UserSession(id, userId, expiresAt, revokedAt, createdAt);
  }

  revoke(): void {
    this._revokedAt = new Date();
  }

  get isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  get isRevoked(): boolean {
    return this._revokedAt !== undefined;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isRevoked;
  }

  get id() {
    return this._id;
  }

  get userId() {
    return this._userId;
  }

  get expiresAt() {
    return this._expiresAt;
  }

  get revokedAt() {
    return this._revokedAt;
  }

  get createdAt() {
    return this._createdAt;
  }
}

export { UserSession };
