import { type CaseStudy } from '../types';

const observabilityGrafanaVsNewrelic: CaseStudy = {
  slug: 'observability-grafana-vs-newrelic',
  title:
    'Grafana Cloud over New Relic — open standards over proprietary agents',
  subtitle:
    'Having used New Relic on frontend apps, the choice to go with Grafana was deliberate, not unfamiliar.',
  badge: 'Infrastructure',
  summary:
    'This project instruments with OpenTelemetry and exports to Grafana Cloud. New Relic was a real option — I have production experience with their browser monitoring agent for frontend log capture and performance tracking. The decision was about vendor independence, not capability gaps.',
  sections: [
    {
      heading: 'New Relic experience',
      body: "I have hands-on experience integrating New Relic's browser monitoring agent into frontend applications — manually capturing browser logs, tracking page load performance, and correlating frontend errors with backend traces. New Relic's browser SDK (`@newrelic/browser-agent`) provides real user monitoring (RUM), error tracking, and session replay out of the box. The DX is good. The data is rich. The dashboards are polished.",
    },
    {
      heading: 'Why not New Relic here',
      body: "New Relic's strength is its all-in-one platform — install the agent, everything lights up. But that convenience comes with coupling. The `@newrelic/next` agent instruments Next.js with New Relic-specific APIs. Your error capture, span creation, and log forwarding use New Relic's SDK, not an open standard. Switching to a different backend means rewriting instrumentation, not changing an endpoint.",
      table: {
        headers: ['Concern', 'New Relic', 'OpenTelemetry + Grafana'],
        rows: [
          [
            'Instrumentation',
            '@newrelic/next agent — proprietary SDK',
            '@opentelemetry/sdk-node — open standard',
          ],
          [
            'Vendor lock-in',
            'High — New Relic APIs throughout codebase',
            'None — zero vendor imports in application code',
          ],
          [
            'Backend swap',
            'Rewrite instrumentation',
            'Change OTLP endpoint env var',
          ],
          [
            'Free tier',
            '100GB/month with retention limits',
            '50GB traces, 50GB logs, 10k metrics',
          ],
          [
            'Browser monitoring',
            'Built-in RUM, session replay, log capture',
            'Separate concern — Grafana Faro or keep New Relic for frontend',
          ],
          [
            'Setup complexity',
            'Lower — one agent, auto-instrumentation',
            'Higher — SDK init, sampler config, manual span enrichment',
          ],
        ],
      },
    },
    {
      heading: 'The architectural argument',
      body: 'The application code has zero Grafana imports. The IObservabilityService interface calls trace.getActiveSpan() from the OpenTelemetry API — a vendor-neutral package. The buses create spans via a tracer from the same API. The OTLP exporter reads the endpoint from environment variables. Grafana is a deployment decision, not a code decision. Switching to Datadog, Honeycomb, Jaeger, or back to New Relic is an env var change — not a refactor.',
    },
    {
      heading: 'Where New Relic still wins',
      body: "Browser monitoring. OpenTelemetry's frontend story is immature compared to New Relic's browser agent. For a full-stack observability picture — correlating frontend errors with backend traces, capturing user sessions, tracking Core Web Vitals — New Relic's browser SDK or Grafana Faro would complement the backend OpenTelemetry instrumentation. The backend chose open standards. The frontend can choose the best tool for the job independently.",
    },
  ],
};

export { observabilityGrafanaVsNewrelic };
