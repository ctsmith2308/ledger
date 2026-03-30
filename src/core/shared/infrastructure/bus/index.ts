import { CommandBus } from './command-bus';
import { QueryBus } from './query-bus';
import { ObservabilityService } from '../services/observability.service';

const commandBus = new CommandBus(ObservabilityService);
const queryBus = new QueryBus(ObservabilityService);

export { CommandBus, commandBus, QueryBus, queryBus };
