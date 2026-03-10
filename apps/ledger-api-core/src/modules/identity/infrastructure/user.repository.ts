import { IUserRepository } from '@/modules/identity/domain';

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<any> {
    console.log({ email });
  }

  async save(): Promise<any> {
    console.log('saving');
  }
}

export { UserRepository };
