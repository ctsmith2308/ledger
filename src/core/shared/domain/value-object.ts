/**
 * Value Object (DDD). Represents a concept defined by its attributes,
 * not by an identity. Two emails with the same address are the same
 * email. Two passwords with the same content are the same password.
 *
 * Immutable: props are frozen on construction. Equality is by value
 * comparison, not reference. Subclasses expose a static create()
 * factory that returns Result, enforcing invariants before the object
 * can exist. A from() factory is used for reconstitution from trusted
 * sources (database) where validation is unnecessary.
 *
 * Examples: Email, Password, UserId, FirstName, UserTier.
 */
abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props) as T;
  }

  equals(vo?: ValueObject<T>): boolean {
    if (!vo) return false;

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

export { ValueObject };
