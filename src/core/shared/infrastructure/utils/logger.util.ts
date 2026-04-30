/**
 * Lightweight logger for operational output (errors, debug, infra events).
 *
 * This is not a replacement for OpenTelemetry (traces) or domain events
 * (audit). Each serves a different purpose:
 * - Traces: request flows, handler timing, span-level debugging
 * - Domain events: business-level audit (persisted to domain_events table)
 * - Logger: operational noise that doesn't warrant a trace or event
 *   (Plaid API failures during cleanup, EventBus publish errors, rollup
 *   debug output, action client catch boundary)
 *
 * TODO: Replace console transport with Pino for structured JSON logging,
 * production log-level filtering, and Grafana Loki integration. The call
 * sites stay the same; only the transport implementation changes.
 */
const logger = {
  error(message: unknown, traceId?: string): void {
    console.error({ level: 'error', traceId, message });
  },

  warn(message: unknown): void {
    console.warn({ level: 'warn', message });
  },

  info(message: unknown): void {
    console.info({ level: 'info', message });
  },

  debug(message: unknown): void {
    console.debug({ level: 'debug', message });
  },
};

export { logger };
