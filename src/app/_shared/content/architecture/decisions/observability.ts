import { type ArchitectureDecision } from '../types';

const observability: ArchitectureDecision = {
  slug: 'observability',
  title: 'OpenTelemetry + Grafana Cloud — traces without vendor lock-in',
  subtitle:
    'Open standards for instrumentation. The backend is a config swap, not a rewrite.',
  badge: 'Infrastructure',
  context:
    'Handler failures were initially logged to console — invisible in production, impossible to query, no correlation to the request that triggered them. The application needed observability without coupling to a specific vendor. Sentry captures errors well but is proprietary. Datadog is full-stack but expensive. OpenTelemetry is the open standard — instrument once, export anywhere.',
  decision:
    'Instrument the command and query buses with OpenTelemetry spans. Each handler dispatch creates a child span within the active HTTP request trace. Handler failures enrich the active span with error attributes. Traces export to Grafana Cloud via the OTLP HTTP exporter. Sampling is environment-aware: 100% in development, configurable (default 10%) in production.',
  rationale: [
    'The IObservabilityService interface decouples the application from OpenTelemetry. The bus calls recordHandlerFailure() — it does not know about spans, exporters, or Grafana. Swapping the implementation is a one-file change.',
    'Bus-level spans fill the blind spot between the HTTP request span and the response. Without them, 300ms+ of handler execution is invisible in the trace timeline. With them, you see exactly which handler ran and how long it took.',
    'The OpenTelemetry SDK reads OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS from the environment. No Grafana-specific code in the application. Switching to Datadog, Honeycomb, or Jaeger is an env var change.',
    'Sampling prevents cost overrun in production. TraceIdRatioBasedSampler drops a configurable percentage of traces before export. Errors within sampled traces are always enriched — they are not silently dropped.',
  ],
  tradeoffs: [
    {
      pro: 'Open standard — no vendor lock-in. Same instrumentation works with Grafana, Datadog, Jaeger, Zipkin, or any OTLP-compatible backend.',
      con: 'Head-based sampling means some errors in unsampled traces are never exported. True "always capture errors" requires tail-based sampling via an OpenTelemetry Collector — added infrastructure.',
    },
    {
      pro: 'Bus-level spans give handler-granularity visibility. You see GetBudgetOverviewHandler took 45ms, not just "POST /budgets returned in 200ms."',
      con: 'Every handler dispatch creates a span. At high throughput this adds overhead — mitigated by sampling, but the instrumentation cost is nonzero.',
    },
    {
      pro: 'Grafana Cloud free tier provides 50GB traces — effectively unlimited for a portfolio project.',
      con: 'Production traffic at scale would exceed the free tier. The sampling rate (OTEL_SAMPLE_RATE env var) controls cost, but requires tuning per deployment.',
    },
  ],
  codeBlocks: [
    {
      label: 'instrumentation.ts — SDK init with environment-aware sampling',
      code: `export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');
    const { TraceIdRatioBasedSampler, AlwaysOnSampler } = await import('@opentelemetry/sdk-trace-node');

    const isProduction = process.env.NODE_ENV === 'production';
    const sampleRate = Number(process.env.OTEL_SAMPLE_RATE ?? (isProduction ? 0.1 : 1.0));

    const sampler = sampleRate >= 1.0
      ? new AlwaysOnSampler()
      : new TraceIdRatioBasedSampler(sampleRate);

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'ledger' }),
      traceExporter: new OTLPTraceExporter(),
      sampler,
    });

    sdk.start();
  }
}`,
    },
    {
      label: 'Bus dispatch — handler spans as children of the request trace',
      code: `// CommandBus.dispatch — same pattern in QueryBus
async dispatch<T extends AnyCommand>(command: T): Promise<T['_response']> {
  const key = command.constructor.name;
  const handler = this._handlers.get(key);

  return tracer.startActiveSpan(\`command.\${key}\`, async (span) => {
    try {
      const result = await handler.execute(command);
      span.end();
      return result;
    } catch (error) {
      this.observability.recordHandlerFailure(key, error);
      span.end();
      throw error;
    }
  });
}`,
    },
    {
      label: 'ObservabilityService — enriches the active span, no new span',
      code: `const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const span = trace.getActiveSpan();
    if (!span) return;

    span.setAttribute('handler.name', handlerName);
    span.setAttribute('error.type', error instanceof Error ? error.constructor.name : 'UnknownError');
    span.setAttribute('error.message', error instanceof Error ? error.message : 'Unknown error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  },
};`,
    },
    {
      label: 'Scaling path — tail-based sampling via Collector',
      code: `// Today: head-based sampling (SDK decides before export)
// Limitation: unsampled requests lose their error traces
//
// Production upgrade: OpenTelemetry Collector with tail-based sampling
//
// App (SDK, sample 100%) → Collector → evaluates complete traces
//   → errors: always export to Grafana
//   → successes: export 10% to Grafana
//   → rest: drop
//
// App code unchanged. Collector is a deployment concern.
// OTEL_EXPORTER_OTLP_ENDPOINT points to Collector instead of Grafana.`,
    },
  ],
};

export { observability };
