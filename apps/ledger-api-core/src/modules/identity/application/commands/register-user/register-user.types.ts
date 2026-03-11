import { Result } from '@/shared/domain';

import {
  InvalidEmailException,
  InvalidPasswordException,
} from '@/modules/identity/domain/exceptions';

type RegisterUserResponse = Result<
  { id: string },
  InvalidEmailException | InvalidPasswordException | Error
>;

export type { RegisterUserResponse };
