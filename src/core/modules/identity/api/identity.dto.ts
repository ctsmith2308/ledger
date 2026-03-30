type JwtDTO = {
  accessToken: string;
  refreshToken: string;
};

type UserDTO =
  | { type: 'SUCCESS'; id: string; email: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

type UserProfileDTO = {
  userId: string;
  firstName: string;
  lastName: string;
};

type CleanupDTO = {
  deleted: number;
  total: number;
};

export type { JwtDTO, UserDTO, UserProfileDTO, CleanupDTO };
