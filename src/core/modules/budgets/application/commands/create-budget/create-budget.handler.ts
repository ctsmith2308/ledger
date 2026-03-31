import { IHandler, IEventBus, Result, BudgetAlreadyExistsException } from '@/core/shared/domain';
import { IBudgetRepository, Budget } from '@/core/modules/budgets/domain';
import { IIdGenerator } from '@/core/shared/domain';
import {
  CreateBudgetCommand,
  CreateBudgetResponse,
} from './create-budget.command';

class CreateBudgetHandler
  implements IHandler<CreateBudgetCommand, CreateBudgetResponse>
{
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly eventBus: IEventBus,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(command: CreateBudgetCommand): Promise<CreateBudgetResponse> {
    const existing = await this.budgetRepository.findByUserIdAndCategory(
      command.userId,
      command.category,
    );

    if (existing) {
      return Result.fail(new BudgetAlreadyExistsException());
    }

    const id = this.idGenerator.generate();
    const budget = Budget.create(
      id,
      command.userId,
      command.category,
      command.monthlyLimit,
    );

    await this.budgetRepository.save(budget);

    const events = budget.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok(budget);
  }
}

export { CreateBudgetHandler };
