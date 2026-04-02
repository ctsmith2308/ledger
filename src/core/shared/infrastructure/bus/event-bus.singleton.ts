import { prisma } from '../persistence/prisma.singleton';

import { DurableEventBus } from './durable-event-bus.impl';

const eventBus = new DurableEventBus(prisma);

export { eventBus };
