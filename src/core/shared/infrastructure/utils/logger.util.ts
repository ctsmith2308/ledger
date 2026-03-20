// Transport: currently console. Replace with Pino, Winston, etc. by swapping
// the console calls below — the call sites remain unchanged.

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
