import { Client } from '@upstash/qstash';

import { prisma } from '../persistence/prisma.singleton';

import { EventBus } from './event-bus.impl';

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL,
});
const appUrl = process.env.APP_URL!;

const eventBus = new EventBus(prisma, qstash, appUrl);

export { eventBus };
