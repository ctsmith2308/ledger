/**
 * Structured logger via Pino.
 *
 * - Production: JSON to stdout (machine-readable for Grafana Loki / any log drain)
 * - Development: pino-pretty for human-readable colored output
 *
 * Log level defaults to "info" in production, "debug" in development.
 * Override with the LOG_LEVEL env var.
 */
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const devTransport = {
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
};

const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  ...(!isProduction && devTransport),
});

export { logger };
