import { Transaction } from '@/core/modules/transactions/domain';
import { TransactionDTO } from '../transactions.dto';

const TransactionMapper = {
  toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      plaidTransactionId: transaction.plaidTransactionId,
      amount: transaction.amount,
      date: transaction.date.toISOString(),
      name: transaction.name,
      merchantName: transaction.merchantName,
      category: transaction.category,
      detailedCategory: transaction.detailedCategory,
      pending: transaction.pending,
      paymentChannel: transaction.paymentChannel,
    };
  },

  toDTOList(transactions: Transaction[]): TransactionDTO[] {
    return transactions.map(TransactionMapper.toDTO);
  },
};

export { TransactionMapper };
