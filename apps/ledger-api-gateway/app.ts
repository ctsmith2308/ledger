import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCors from '@fastify/cors';
import fastifyHttpProxy from '@fastify/http-proxy';
import { appHealthRoutes, intelligenceRoutes, webhookRoutes } from './routes';
import { authMiddleware } from './middleware';

async function buildApp() {
  const CORE_API_URL = process.env.CORE_API_URL ?? 'http://localhost:3001';

  const app = Fastify({ logger: true, requestIdLogLabel: 'requestId' });

  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(fastifyHttpProxy, {
    upstream: CORE_API_URL,
    prefix: '/api/auth',
    http2: false,
  });

  // TODO
  // Plugins
  // await app.register(fastifyCors, {
  //   origin: process.env.FRONTEND_URL,
  //   credentials: true,
  // });

  //   await app.register(fastifyJwt, {
  //     secret: process.env.JWT_SECRET!,
  //   });

  // Decoration — makes app.authenticate available to all routes
  //   app.decorate('authenticate', async (request: any, reply: any) => {
  //     try {
  //       await request.jwtVerify();
  //     } catch (err) {
  //       reply.code(401).send({ error: 'Unauthorized' });
  //     }
  //   });

  // Api "health" routes - no auth
  await app.register(appHealthRoutes);
  await app.register(webhookRoutes, { prefix: '/webhooks' });

  await app.register(
    async (protectedApp) => {
      protectedApp.addHook('preHandler', authMiddleware);

      await protectedApp.register(fastifyHttpProxy, {
        upstream: CORE_API_URL,
        prefix: '/api/accounts',
        http2: false,
      });

      await protectedApp.register(fastifyHttpProxy, {
        upstream: CORE_API_URL,
        prefix: '/api/transactions',
        http2: false,
      });

      await protectedApp.register(fastifyHttpProxy, {
        upstream: CORE_API_URL,
        prefix: '/api/budgets',
        http2: false,
      });

      await protectedApp.register(intelligenceRoutes, {
        prefix: '/api/intelligence',
      });
    },
    { prefix: '' },
  );
  return app;
}

export { buildApp };
