import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetQueryData = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryData: mockGetQueryData,
  }),
}));

import { useSession } from '../use-session.hook';

describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when cache is empty', () => {
    mockGetQueryData.mockReturnValue(undefined);

    const result = useSession();

    expect(result).toBeNull();
  });

  it('returns session data from cache', () => {
    const session = { userId: 'user-1', email: 'test@example.com', tier: 'TRIAL' };
    mockGetQueryData.mockReturnValue(session);

    const result = useSession();

    expect(result).toEqual(session);
  });

  it('reads from the session query key', () => {
    mockGetQueryData.mockReturnValue(undefined);

    useSession();

    expect(mockGetQueryData).toHaveBeenCalledWith(['session']);
  });
});
