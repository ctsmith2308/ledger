type LoginSuccessDTO = {
  type: 'SUCCESS';
  token: string;
};

type MfaChallengeDTO = {
  type: 'MFA_REQUIRED';
  token: string;
};

type LoginResponseDTO = LoginSuccessDTO | MfaChallengeDTO;

type MfaSetupDTO = {
  qrCodeDataUrl: string;
};

type UserDTO =
  | { type: 'SUCCESS'; id: string; email: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

type UserAccountDTO = {
  email: string;
  tier: string;
  mfaEnabled: boolean;
  firstName: string;
  lastName: string;
  features: string[];
};

type CleanupDTO = {
  deleted: number;
  total: number;
};

export type {
  LoginSuccessDTO,
  MfaChallengeDTO,
  LoginResponseDTO,
  MfaSetupDTO,
  UserDTO,
  UserAccountDTO,
  CleanupDTO,
};
