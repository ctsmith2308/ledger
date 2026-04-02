import { type SpendingPeriodsDTO } from '../transactions.dto';

const SpendingPeriodsMapper = {
  toDTO(periods: string[]): SpendingPeriodsDTO {
    return { periods };
  },
};

export { SpendingPeriodsMapper };
