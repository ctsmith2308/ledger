/**
 * Next.js instrumentation hook. Called once on server startup.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Initializes the OpenTelemetry Node SDK with:
 * - OTLP HTTP exporter (reads endpoint/headers from env vars)
 * - Environment-aware sampling: 100% in dev, configurable via
 *   OTEL_SAMPLE_RATE in production (default 10%)
 *
 * All instrumentation uses the OpenTelemetry API (vendor-neutral).
 * No Grafana, Datadog, or other vendor imports exist in application
 * code. The backend is a deployment decision controlled entirely by
 * OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS.
 *
 * https://github.com/open-telemetry/opentelemetry-js
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');

    const { OTLPTraceExporter } =
      await import('@opentelemetry/exporter-trace-otlp-http');

    const { resourceFromAttributes } = await import('@opentelemetry/resources');

    const { ATTR_SERVICE_NAME } =
      await import('@opentelemetry/semantic-conventions');

    const { TraceIdRatioBasedSampler, AlwaysOnSampler } =
      await import('@opentelemetry/sdk-trace-node');

    const isProduction = process.env.NODE_ENV === 'production';

    const sampleRate = Number(process.env.OTEL_SAMPLE_RATE ?? (isProduction ? 0.1 : 1.0));

    const sampler = sampleRate >= 1.0
      ? new AlwaysOnSampler()
      : new TraceIdRatioBasedSampler(sampleRate);

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'ledger',
      }),
      traceExporter: new OTLPTraceExporter(),
      sampler,
    });

    sdk.start();
  }
}
