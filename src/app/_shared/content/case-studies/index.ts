import { type CaseStudy, type CaseStudySection } from './types';
import { trpcVsServerActions } from './studies/trpc-vs-server-actions';
import { nestjsOverhead } from './studies/nestjs-overhead';
import { nuxtToNextjs } from './studies/nuxt-to-nextjs';
import { domainEventOwnership } from './studies/domain-event-ownership';
import { observabilityGrafanaVsNewrelic } from './studies/observability-grafana-vs-newrelic';
import { tanstackQuerySafeAction } from './studies/tanstack-query-safe-action';

const caseStudies: CaseStudy[] = [
  trpcVsServerActions,
  nestjsOverhead,
  nuxtToNextjs,
  domainEventOwnership,
  observabilityGrafanaVsNewrelic,
  tanstackQuerySafeAction,
];

const getCaseStudy = (slug: string): CaseStudy | undefined =>
  caseStudies.find((c) => c.slug === slug);

const getCaseSlugs = (): string[] => caseStudies.map((c) => c.slug);

export {
  caseStudies,
  getCaseStudy,
  getCaseSlugs,
  type CaseStudy,
  type CaseStudySection,
};
