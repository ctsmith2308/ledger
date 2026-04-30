/**
 * EventBus singleton. All modules import this shared instance.
 *
 * Swapping the event delivery mechanism (e.g. to SQS, Redis Streams)
 * means replacing this file. Module code stays the same because it
 * depends on the IEventBus interface, not this implementation.
 */
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
