import { AggregateRoot } from '@/core/shared/domain';
import { TransactionCreatedEvent } from '../events';

type TransactionUpdateFields = {
  amount?: number;
  date?: Date;
  name?: string;
  merchantName?: string | undefined;
  category?: string | undefined;
  detailedCategory?: string | undefined;
  pending?: boolean;
  paymentChannel?: string | undefined;
};

class Transaction extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private readonly _userId: string,
    private readonly _plaidTransactionId: string,
    private _amount: number,
    private _date: Date,
    private _name: string,
    private _merchantName: string | undefined,
    private _category: string | undefined,
    private _detailedCategory: string | undefined,
    private _pending: boolean,
    private _paymentChannel: string | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(
    id: string,
    accountId: string,
    userId: string,
    plaidTransactionId: string,
    amount: number,
    date: Date,
    name: string,
    merchantName: string | undefined,
    category: string | undefined,
    detailedCategory: string | undefined,
    pending: boolean,
    paymentChannel: string | undefined,
  ): Transaction {
    const now = new Date();
    const transaction = new Transaction(
      id,
      accountId,
      userId,
      plaidTransactionId,
      amount,
      date,
      name,
      merchantName,
      category,
      detailedCategory,
      pending,
      paymentChannel,
      now,
      now,
    );

    transaction.addDomainEvent(
      new TransactionCreatedEvent(id, userId, amount, date, category),
    );

    return transaction;
  }

  static reconstitute(
    id: string,
    accountId: string,
    userId: string,
    plaidTransactionId: string,
    amount: number,
    date: Date,
    name: string,
    merchantName: string | undefined,
    category: string | undefined,
    detailedCategory: string | undefined,
    pending: boolean,
    paymentChannel: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ): Transaction {
    return new Transaction(
      id,
      accountId,
      userId,
      plaidTransactionId,
      amount,
      date,
      name,
      merchantName,
      category,
      detailedCategory,
      pending,
      paymentChannel,
      createdAt,
      updatedAt,
    );
  }

  update(fields: TransactionUpdateFields): void {
    if (fields.amount !== undefined) this._amount = fields.amount;
    if (fields.date !== undefined) this._date = fields.date;
    // if (fields.name !== undefined) this._name = fields.name;
    if ('merchantName' in fields) this._merchantName = fields.merchantName;
    if ('category' in fields) this._category = fields.category;
    if ('detailedCategory' in fields)
      this._detailedCategory = fields.detailedCategory;
    if (fields.pending !== undefined) this._pending = fields.pending;
    if ('paymentChannel' in fields)
      this._paymentChannel = fields.paymentChannel;
    this._updatedAt = new Date();
  }

  get id() {
    return this._id;
  }

  get accountId() {
    return this._accountId;
  }

  get userId() {
    return this._userId;
  }

  get plaidTransactionId() {
    return this._plaidTransactionId;
  }

  get amount() {
    return this._amount;
  }

  get date() {
    return this._date;
  }

  get name() {
    return this._name;
  }

  get merchantName() {
    return this._merchantName;
  }

  get category() {
    return this._category;
  }

  get detailedCategory() {
    return this._detailedCategory;
  }

  get pending() {
    return this._pending;
  }

  get paymentChannel() {
    return this._paymentChannel;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}

export { Transaction, type TransactionUpdateFields };
