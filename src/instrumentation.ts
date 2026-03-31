// https://github.com/open-telemetry/opentelemetry-js

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
