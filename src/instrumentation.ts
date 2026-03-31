//https://github.com/open-telemetry/opentelemetry-js

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');

    const { OTLPTraceExporter } =
      await import('@opentelemetry/exporter-trace-otlp-http');

    const { resourceFromAttributes } = await import('@opentelemetry/resources');

    const { ATTR_SERVICE_NAME } =
      await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'ledger',
      }),
      traceExporter: new OTLPTraceExporter(),
    });

    sdk.start();
  }
}
