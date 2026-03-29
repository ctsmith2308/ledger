type SessionDTO = {
  sessionId: string;
  userId: string;
  tier: string;
};

type UserDTO =
  | { type: 'SUCCESS'; id: string; email: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

type UserProfileDTO = {
  userId: string;
  firstName: string;
  lastName: string;
};

export type { SessionDTO, UserDTO, UserProfileDTO };
