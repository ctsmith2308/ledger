import { PrismaService } from '@/shared/infrastructure/persistence';
import { UserRepository } from '@/modules/identity/infrastructure/repositories';
import { User, Email, Password, UserId } from '@/modules/identity/domain';

describe('UserRepository (integration)', () => {
  let prisma: PrismaService;
  let repo: UserRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should persist a new user via save()', async () => {
    const user = User.register(
      UserId.from('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
      Email.from('integration@test.com'),
      Password.fromHash('$argon2id$testhash'),
    );

    await repo.save(user);

    const record = await prisma.user.findUnique({
      where: { email: 'integration@test.com' },
    });

    expect(record).not.toBeNull();
    expect(record!.email).toBe('integration@test.com');
    expect(record!.passwordHash).toBe('$argon2id$testhash');
    expect(record!.mfaEnabled).toBe(false);
    expect(record!.mfaSecret).toBeNull();
  });

  it('should find a user by email via findByEmail()', async () => {
    const user = User.register(
      UserId.from('b1ffcd00-1d1c-5fg9-cc7e-7cc0ce491b22'),
      Email.from('findme@test.com'),
      Password.fromHash('$argon2id$anotherhash'),
    );

    await repo.save(user);

    const found = await repo.findByEmail(Email.create('findme@test.com').value);

    expect(found).not.toBeNull();
    expect(found!.email.address).toBe('findme@test.com');
    expect(found!.mfaEnabled).toBe(false);
  });

  it('should return null when user does not exist', async () => {
    const found = await repo.findByEmail(Email.create('ghost@test.com').value);
    expect(found).toBeNull();
  });

  it('should upsert without creating a duplicate', async () => {
    const id = UserId.from('c2ggde11-2e2d-6gh0-dd8f-8dd1df502c33');
    const email = Email.from('upsert@test.com');

    const user = User.register(id, email, Password.fromHash('hash-v1'));
    await repo.save(user);

    // save again with same id — should update, not insert
    const updated = User.reconstitute(
      id,
      email,
      Password.fromHash('hash-v2'),
      false,
    );
    await repo.save(updated);

    const records = await prisma.user.findMany({
      where: { email: 'upsert@test.com' },
    });

    expect(records).toHaveLength(1);
    expect(records[0].passwordHash).toBe('hash-v2');
  });
});
