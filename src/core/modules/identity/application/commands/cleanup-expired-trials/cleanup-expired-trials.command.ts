import { Command, DomainException, Result } from '@/core/shared/domain';

type CleanupResult = {
  deleted: number;
  total: number;
};

type CleanupExpiredTrialsResponse = Result<CleanupResult, DomainException>;

class CleanupExpiredTrialsCommand extends Command<CleanupExpiredTrialsResponse> {}

export {
  CleanupExpiredTrialsCommand,
  type CleanupExpiredTrialsResponse,
  type CleanupResult,
};
