import { IdentityController } from '../indentity.controller';
import { RegisterUserDto } from '@/modules/identity/api/dtos';

const mockCommandBus = { execute: vi.fn() };
const mockQueryBus = { execute: vi.fn() };

describe('IdentityController', () => {
  let controller: IdentityController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new IdentityController(
      mockCommandBus as any,
      mockQueryBus as any,
    );
  });

  describe('POST /auth/register', () => {
    it('should execute RegisterUserCommand with email and password from dto', async () => {
      const dto: RegisterUserDto = {
        email: 'user@example.com',
        password: 'Secure@Pass1',
      };

      mockCommandBus.execute.mockResolvedValue({ id: 'test-uuid-12345' });

      await controller.register(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'Secure@Pass1',
        }),
      );
    });

    it('should return the result from the command bus', async () => {
      const dto: RegisterUserDto = {
        email: 'user@example.com',
        password: 'Secure@Pass1',
      };

      mockCommandBus.execute.mockResolvedValue({ id: 'test-uuid-12345' });

      const result = await controller.register(dto);

      expect(result).toEqual({ id: 'test-uuid-12345' });
    });
  });
});
