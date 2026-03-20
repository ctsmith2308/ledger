// TODO: Wire up a telemetry provider (New Relic, OpenTelemetry, Splunk, etc.)
//
// This service is the single integration point for observability tooling.
// App code should never call provider SDKs directly — route through here so
// the underlying tool can be swapped without touching call sites.
//
// Suggested interface:
//   trackEvent(name: string, properties?: Record<string, unknown>): void
//   trackError(error: unknown, context?: Record<string, unknown>): void
//   startSpan(name: string): Span
//
// Example providers:
//   - OpenTelemetry: @opentelemetry/sdk-node
//   - New Relic:     newrelic
//   - Splunk:        @splunk/otel
//
// Note: Prisma has its own logging system configured at the client level
// (prisma.$on('query', ...), prisma.$on('error', ...)) — keep that separate
// and do not route Prisma logs through this service.

const TelemetryService = {
  // TODO: implement
};

export { TelemetryService };
