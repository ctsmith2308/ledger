import { DomainEvent, BankingEvents } from '@/core/shared/domain';

class BankAccountLinkedEvent extends DomainEvent {
  readonly userId: string;
  readonly institutionId: string | undefined;

  constructor(
    aggregateId: string,
    userId: string,
    institutionId?: string,
  ) {
    super(aggregateId, BankingEvents.BANK_ACCOUNT_LINKED);
    this.userId = userId;
    this.institutionId = institutionId;
  }
}

export { BankAccountLinkedEvent };
