import { type ArchitectureDecision, type CodeBlock } from './types';
import { cqrsCommandBus } from './decisions/cqrs-command-bus';
import { modularMonolith } from './decisions/modular-monolith';
import { domainDrivenDesign } from './decisions/domain-driven-design';
import { eventBus } from './decisions/event-bus';
import { serverActions } from './decisions/server-actions';
import { fsdFrontend } from './decisions/fsd-frontend';
import { cqrsReadModel } from './decisions/cqrs-read-model';
import { eventHandlerOrdering } from './decisions/event-handler-ordering';
import { durableEventBus } from './decisions/durable-event-bus';
import { jwtAuth } from './decisions/jwt-auth';
import { mfa } from './decisions/mfa';
import { featureFlags } from './decisions/feature-flags';
import { observability } from './decisions/observability';
import { healthChecks } from './decisions/health-checks';

const decisions: ArchitectureDecision[] = [
  modularMonolith,
  cqrsCommandBus,
  durableEventBus,
  domainDrivenDesign,
  cqrsReadModel,
  eventBus,
  eventHandlerOrdering,
  serverActions,
  jwtAuth,
  mfa,
  featureFlags,
  fsdFrontend,
  observability,
  healthChecks,
];

const getDecision = (slug: string): ArchitectureDecision | undefined =>
  decisions.find((d) => d.slug === slug);

const getSlugs = (): string[] => decisions.map((d) => d.slug);

export {
  decisions,
  getDecision,
  getSlugs,
  type CodeBlock,
  type ArchitectureDecision,
};
