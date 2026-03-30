import { AggregateRoot } from '@/core/shared/domain';
import { BankAccountLinkedEvent } from '../events';

class PlaidItem extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _accessToken: string,
    private readonly _institutionId: string | undefined,
    private _cursor: string | undefined,
    private readonly _createdAt: Date,
  ) {
    super();
  }

  static link(
    id: string,
    userId: string,
    accessToken: string,
    institutionId?: string,
  ): PlaidItem {
    const item = new PlaidItem(
      id,
      userId,
      accessToken,
      institutionId,
      undefined,
      new Date(),
    );

    item.addDomainEvent(
      new BankAccountLinkedEvent(id, userId, institutionId),
    );

    return item;
  }

  static reconstitute(
    id: string,
    userId: string,
    accessToken: string,
    institutionId: string | undefined,
    cursor: string | undefined,
    createdAt: Date,
  ): PlaidItem {
    return new PlaidItem(
      id,
      userId,
      accessToken,
      institutionId,
      cursor,
      createdAt,
    );
  }

  updateCursor(cursor: string): void {
    this._cursor = cursor;
  }

  get id() {
    return this._id;
  }

  get userId() {
    return this._userId;
  }

  get accessToken() {
    return this._accessToken;
  }

  get institutionId() {
    return this._institutionId;
  }

  get cursor() {
    return this._cursor;
  }

  get createdAt() {
    return this._createdAt;
  }
}

export { PlaidItem };
