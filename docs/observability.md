# Observability

**External references:**
- [OpenTelemetry](https://opentelemetry.io/)
- [@opentelemetry/sdk-node](https://www.npmjs.com/package/@opentelemetry/sdk-node)
- [@opentelemetry/exporter-trace-otlp-http](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http)
- [Grafana Cloud](https://grafana.com/products/cloud/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

## Overview

The application exports [OpenTelemetry](https://opentelemetry.io/) traces to [Grafana Cloud](https://grafana.com/products/cloud/) via OTLP HTTP. The instrumentation is configured through three environment variables:

- `OTEL_EXPORTER_OTLP_ENDPOINT` -- the OTLP HTTP endpoint (e.g., `https://otlp-gateway-prod-us-central-0.grafana.net/otlp`).
- `OTEL_EXPORTER_OTLP_HEADERS` -- authentication headers (e.g., `Authorization=Basic <base64>`).
- `OTEL_SAMPLE_RATE` -- fraction of traces to export in production (default `0.1`, i.e., 10%).

There is zero Grafana-specific code in the application. Switching to Datadog, Honeycomb, Jaeger, or any OTLP-compatible backend is an environment variable change.

---

## SDK Initialization

**Source:** `src/instrumentation.ts`

The `register()` function runs only when `NEXT_RUNTIME === 'nodejs'` -- it is skipped on the Edge runtime. All imports are dynamic to avoid bundling OTel into edge workers.

```ts
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
    const sampleRate = Number(
      process.env.OTEL_SAMPLE_RATE ?? (isProduction ? 0.1 : 1.0),
    );

    const sampler =
      sampleRate >= 1.0
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
```

The `OTLPTraceExporter` picks up `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` from the environment automatically -- no explicit configuration is passed.

---

## Bus-Level Tracing

**Sources:** `src/core/shared/infrastructure/bus/command-bus.impl.ts`, `src/core/shared/infrastructure/bus/query-bus.impl.ts`

Both `CommandBus` and `QueryBus` create a child span for every handler dispatch using `tracer.startActiveSpan()`. The span name follows the convention `command.{ClassName}` or `query.{ClassName}`.

```ts
const tracer = trace.getTracer('ledger');

// Inside dispatch():
return tracer.startActiveSpan(`command.${key}`, async (span) => {
  try {
    const result = (await handler.execute(command)) as Promise<T['_response']>;
    span.end();
    return result;
  } catch (error) {
    this.observability.recordHandlerFailure(key, error);
    span.end();
    throw error;
  }
});
```

Because the bus creates the span as an active span, it appears as a child of the HTTP request trace in Grafana. This gives visibility into handler execution time within the broader request lifecycle. The `QueryBus` follows the identical pattern with the `query.` prefix.

---

## ObservabilityService

### Interface

**Source:** `src/core/shared/domain/services/observability.service.interface.ts`

```ts
interface IObservabilityService {
  recordHandlerFailure(handlerName: string, error: unknown): void;
}
```

The interface is defined in the domain layer so the bus can depend on it without importing OTel.

### Implementation

**Source:** `src/core/shared/infrastructure/services/observability.service.impl.ts`

The implementation is a plain object (stateless, no class needed). It enriches the currently active span with error metadata and sets the span status to `ERROR`:

```ts
const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const span = trace.getActiveSpan();
    if (!span) return;

    const message =
      error instanceof Error ? error.message : 'Unknown error';
    const type =
      error instanceof Error ? error.constructor.name : 'UnknownError';

    span.setAttribute('handler.name', handlerName);
    span.setAttribute('error.type', type);
    span.setAttribute('error.message', message);
    span.setStatus({ code: SpanStatusCode.ERROR, message });
  },
};
```

### Why not the handler?

Handlers are application layer -- they coordinate domain logic and return `Result` values. They do not know about spans, tracers, or OpenTelemetry. The bus owns the span lifecycle: it creates the span before dispatch and ends it after. The `ObservabilityService` is infrastructure -- it enriches spans that already exist, it does not create them. This keeps the application layer clean and the observability concern contained in infrastructure.

---

## Sampling

Sampling is head-based via `TraceIdRatioBasedSampler`. The decision is made at trace creation time.

| Environment | Sample Rate | Sampler | Effect |
|---|---|---|---|
| Development | `1.0` (default) | `AlwaysOnSampler` | Every trace is exported. Full visibility during development. |
| Production | `0.1` (default, configurable via `OTEL_SAMPLE_RATE`) | `TraceIdRatioBasedSampler` | 10% of traces exported. Reduces cost and volume. |

When `sampleRate >= 1.0`, the code uses `AlwaysOnSampler` directly instead of `TraceIdRatioBasedSampler(1.0)` for clarity.

### Upgrade path: tail-based sampling

Head-based sampling means error traces can be dropped before they are exported. The documented upgrade path is to deploy an OpenTelemetry Collector as an intermediate layer. The Collector can apply tail-based sampling rules: always capture error traces, sample successful traces at a configurable rate. This requires no application code changes -- the app continues to export 100% of traces to the Collector, and the Collector decides what to forward to the backend.

---

## Grafana Cloud

The application targets Grafana Cloud's free tier (50 GB traces). Since all instrumentation uses standard OpenTelemetry APIs and the OTLP HTTP exporter, the backend is not coupled to Grafana in any way. Switching to Datadog, Honeycomb, Jaeger, or a self-hosted OTel Collector requires only changing `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS`.
