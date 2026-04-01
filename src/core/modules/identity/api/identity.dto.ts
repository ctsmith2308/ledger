type LoginSuccessDTO = {
  type: 'SUCCESS';
  accessToken: string;
};

type MfaChallengeDTO = {
  type: 'MFA_REQUIRED';
  challengeToken: string;
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
};

type UserProfileDTO = {
  userId: string;
  firstName: string;
  lastName: string;
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
  UserProfileDTO,
  CleanupDTO,
};
