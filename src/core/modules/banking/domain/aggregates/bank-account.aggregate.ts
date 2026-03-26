import { AggregateRoot } from '@/core/shared/domain';

class BankAccount extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _plaidItemId: string,
    private readonly _plaidAccountId: string,
    private readonly _name: string,
    private readonly _officialName: string | undefined,
    private readonly _mask: string | undefined,
    private readonly _type: string,
    private readonly _subtype: string | undefined,
    private _availableBalance: number | undefined,
    private _currentBalance: number | undefined,
    private readonly _currencyCode: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(
    id: string,
    plaidItemId: string,
    plaidAccountId: string,
    name: string,
    officialName: string | undefined,
    mask: string | undefined,
    type: string,
    subtype: string | undefined,
    availableBalance: number | undefined,
    currentBalance: number | undefined,
    currencyCode: string,
  ): BankAccount {
    const now = new Date();

    return new BankAccount(
      id,
      plaidItemId,
      plaidAccountId,
      name,
      officialName,
      mask,
      type,
      subtype,
      availableBalance,
      currentBalance,
      currencyCode,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    plaidItemId: string,
    plaidAccountId: string,
    name: string,
    officialName: string | undefined,
    mask: string | undefined,
    type: string,
    subtype: string | undefined,
    availableBalance: number | undefined,
    currentBalance: number | undefined,
    currencyCode: string,
    createdAt: Date,
    updatedAt: Date,
  ): BankAccount {
    return new BankAccount(
      id,
      plaidItemId,
      plaidAccountId,
      name,
      officialName,
      mask,
      type,
      subtype,
      availableBalance,
      currentBalance,
      currencyCode,
      createdAt,
      updatedAt,
    );
  }

  updateBalances(
    available: number | undefined,
    current: number | undefined,
  ): void {
    this._availableBalance = available;
    this._currentBalance = current;
    this._updatedAt = new Date();
  }

  get id() {
    return this._id;
  }

  get plaidItemId() {
    return this._plaidItemId;
  }

  get plaidAccountId() {
    return this._plaidAccountId;
  }

  get name() {
    return this._name;
  }

  get officialName() {
    return this._officialName;
  }

  get mask() {
    return this._mask;
  }

  get type() {
    return this._type;
  }

  get subtype() {
    return this._subtype;
  }

  get availableBalance() {
    return this._availableBalance;
  }

  get currentBalance() {
    return this._currentBalance;
  }

  get currencyCode() {
    return this._currencyCode;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}

export { BankAccount };
