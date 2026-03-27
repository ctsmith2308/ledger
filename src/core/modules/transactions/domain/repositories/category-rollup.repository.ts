type CategoryRollupRecord = {
  userId: string;
  category: string;
  period: string;
  totalCents: number;
  transactionCount: number;
};

interface ICategoryRollupRepository {
  upsert(
    userId: string,
    category: string,
    period: string,
    amountCents: number,
  ): Promise<void>;
  findByUserAndPeriod(
    userId: string,
    period: string,
  ): Promise<CategoryRollupRecord[]>;
}

export { type ICategoryRollupRepository, type CategoryRollupRecord };
